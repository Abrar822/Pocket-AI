from fastapi import FastAPI, UploadFile, File, status, APIRouter, HTTPException
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from sentence_transformers import SentenceTransformer
from .llm_call import llm_call
import gc
import shutil
import uuid
import os

pdf_router = APIRouter()

latest_file_id = None


class SentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_path):
        self.model = SentenceTransformer(model_path)

    def embed_documents(self, texts):
        return self.model.encode(
            texts, batch_size=32, show_progress_bar=True, convert_to_numpy=True
        ).tolist()

    def embed_query(self, text):
        return self.model.encode(text, convert_to_numpy=True).tolist()


embeddings = SentenceTransformerEmbeddings(
    r"./backend/st_model_all_MiniLM_L6_v2/all-MiniLM-L6-v2"
)

if not embeddings:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="embeddings not found")
    


@pdf_router.post("/pdf/upload",status_code=status.HTTP_201_CREATED)
async def upload_pdf(file: UploadFile = File(...)):
    global latest_file_id

    try:

        # Check file
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="pdf not found")

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,detail="Please upload only PDF files")

        file_id = str(uuid.uuid4())
        latest_file_id = file_id

        os.makedirs("uploads", exist_ok=True)

        pdf_path = f"uploads/{file_id}.pdf"

        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        loader = PyMuPDFLoader(pdf_path)
        documents = loader.load()

        if not documents:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="pdf not found")

        # split into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        for chunk in chunks:
            chunk.metadata["file_id"] = file_id
            chunk.metadata["filename"] = file.filename

        # storing vectors in cromadb
        vector_store = Chroma(
            collection_name="pdf_documents",
            embedding_function=embeddings,
            persist_directory="./chroma_db",
            collection_metadata={"hnsw:space": "cosine"},
        )

        vector_store.add_documents(chunks)
        vector_store._client.close()

        del vector_store
        gc.collect()

        latest_file_id = file_id

        return {
            "message": "embeddings successfully stored in cromadb",
            "filename": file.filename,
            "file_id": file_id,
            "pages": len(documents),
            "chunks": len(chunks),
        }
    except Exception as e:
        return {"error":f"Upload failed: {str(e)}"}


@pdf_router.post("/pdf/query",status_code=status.HTTP_200_OK)
async def query_pdf(query: str):

    global latest_file_id

    try:
        if latest_file_id is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="plese upload pdf first")

        vector_store = Chroma(
            collection_name="pdf_documents",
            embedding_function=embeddings,
            persist_directory="./chroma_db",
            collection_metadata={"hnsw:space": "cosine"},
        )

        results = vector_store.similarity_search_with_score(
            query, k=5, filter={"file_id": latest_file_id}
        )
        text = []
        for i in range(len(results)):
            text.append(results[i][0].page_content)

        prompt = f"""
        User Query: {query}
        Context From Documents: {" ".join(text)}
        """

        data = llm_call(prompt)
        vector_store._client.close()

        del vector_store
        gc.collect()

        
        if not results:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="responce not found")
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return {"error":f"Responce failed: {str(e)}"}


@pdf_router.delete("/pdf/delete",status_code=status.HTTP_204_NO_CONTENT)
async def delete_db_pdf():

    global latest_file_id

    try:
        vector_store = Chroma(
            collection_name="pdf_documents",
            embedding_function=embeddings,
            persist_directory="./chroma_db",
            collection_metadata={"hnsw:space": "cosine"},
        )

        # Delete entire Chroma collection
        vector_store.delete_collection()

        # Close Chroma client to release SQLite/file locks
        vector_store._client.close()

        # Remove Python references
        del vector_store
        gc.collect()

        
        if os.path.exists("chroma_db"):
            shutil.rmtree("chroma_db")

        if os.path.exists("uploads"):
            shutil.rmtree("uploads")

        latest_file_id = None
    except Exception as e:
        return {"error": f"Delete failed: {str(e)}"}
