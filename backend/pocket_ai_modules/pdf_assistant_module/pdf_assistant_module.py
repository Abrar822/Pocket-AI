from fastapi import UploadFile, File, status, APIRouter, HTTPException
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
from pathlib import Path

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


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "st_model_all_MiniLM_L6_v2" / "all-MiniLM-L6-v2"
embeddings = SentenceTransformerEmbeddings(str(MODEL_PATH))

if not embeddings:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="embeddings not found"
    )

path_chroma = BASE_DIR / "chroma_db"
path_uploads = BASE_DIR / "uploads"


@pdf_router.post("/pdf/upload", status_code=status.HTTP_201_CREATED)
async def upload_pdf(file: UploadFile = File(...)):
    global latest_file_id
    print(file)
    try:

        # Check file
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Please upload pdf"
            )

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Please upload only PDF files",
            )

        file_id = str(uuid.uuid4())
        latest_file_id = file_id

        os.makedirs(path_uploads, exist_ok=True)

        pdf_path = path_uploads / f"{file_id}.pdf"

        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        loader = PyMuPDFLoader(str(pdf_path))
        documents = loader.load()

        if not documents:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="pdf not found",
            )

        # split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800, chunk_overlap=150
        )
        chunks = text_splitter.split_documents(documents)

        for chunk in chunks:
            chunk.metadata["file_id"] = file_id
            chunk.metadata["filename"] = file.filename

        # storing vectors in cromadb

        vector_store = Chroma(
            collection_name="pdf_documents",
            embedding_function=embeddings,
            persist_directory=str(path_chroma),
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload pdf file error:{e}",
        )


from pydantic import BaseModel


class PDFQuery(BaseModel):
    query: str


@pdf_router.post("/pdf/query", status_code=status.HTTP_200_OK)
async def query_pdf(request: PDFQuery):

    global latest_file_id

    try:
        if latest_file_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="plese upload pdf first"
            )
        user_query = request.query
        vector_store = Chroma(
            collection_name="pdf_documents",
            embedding_function=embeddings,
            persist_directory=str(path_chroma),
            collection_metadata={"hnsw:space": "cosine"},
        )

        results = vector_store.similarity_search_with_score(
            user_query, k=3, filter={"file_id": latest_file_id}
        )
        if not results:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="responce not found",
            )
        text = []
        for i in range(len(results)):
            text.append(results[i][0].page_content)

        prompt = f"""
        User Query: {user_query}
        Context From Documents: {" ".join(text)}
        """

        data = llm_call(prompt)
        vector_store._client.close()

        del vector_store
        gc.collect()

        return data["choices"][0]["message"]["content"]

        # return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{str(e)}"
        )


@pdf_router.delete("/pdf/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_db_pdf():

    global latest_file_id

    try:
        vector_store = Chroma(
            collection_name="pdf_documents",
            embedding_function=embeddings,
            persist_directory=str(path_chroma),
            collection_metadata={"hnsw:space": "cosine"},
        )

        # Delete entire Chroma collection
        vector_store.delete_collection()

        # Close Chroma client to release SQLite/file locks
        vector_store._client.close()

        # Remove Python references
        del vector_store
        gc.collect()

        if path_chroma.exists():
            shutil.rmtree(path_chroma)

        if path_uploads.exists():
            shutil.rmtree(path_uploads)

        latest_file_id = None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"error:Delete failed: {str(e)}",
        )
