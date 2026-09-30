from fastapi import FastAPI, UploadFile, File, status,APIRouter
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from .llm_call import llm_call
import gc

# it provides file handling utilities
import shutil

# for generating unique id every time
import uuid

# interact with os
import os

pdf_router = APIRouter()

latest_file_id = None
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


@pdf_router.post("/pdf/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global latest_file_id

    # Check file
    if not file.filename:
        return {"error": "No file selected"}

    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    # saving pdf

    file_id = str(uuid.uuid4())
    latest_file_id = file_id

    os.makedirs("uploads", exist_ok=True)

    pdf_path = f"uploads/{file_id}.pdf"

    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # read pdf

    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()

    # if not documents:
    #     return "document doesn't exists"
    # return documents

    # split into chunks

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)

    chunks = text_splitter.split_documents(documents)

    for chunk in chunks:
        chunk.metadata["file_id"] = file_id
        chunk.metadata["filename"] = file.filename

    # if not chunks:
    #     return "chunk doesn't exists"
    # return chunks

    # now we create embedings(vectors)

    # if not embeddings:
    #     return "not working"
    # text = chunks[0].page_content

    # vector = embeddings.embed_query(text)

    # print("Text:")
    # print(text)

    # print("\nEmbedding:")
    # print(vector)

    # print("\nVector dimensions:")
    # print(len(vector))
    # return embeddings

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


@pdf_router.post("/pdf/query")
async def query_pdf(query: str):
    if latest_file_id is None:
        return {"error": "Please upload a PDF first"}

    # embeddings_query = embeddings.embed_query(query)
    vector_store = Chroma(
        collection_name="pdf_documents",
        embedding_function=embeddings,
        persist_directory="./chroma_db",
        collection_metadata={"hnsw:space": "cosine"},
    )

    results = vector_store.similarity_search_with_score(
        query, k=3, filter={"file_id": latest_file_id}
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

    return data["choices"][0]["message"]["content"]


@pdf_router.delete("/pdf/delete")
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

        # Delete entire ChromaDB directory
        if os.path.exists("chroma_db"):
            shutil.rmtree("chroma_db")

        # Delete all uploaded PDF files
        if os.path.exists("uploads"):
            shutil.rmtree("uploads")

        # Recreate empty uploads directory
        os.makedirs("uploads", exist_ok=True)

        # Reset current PDF
        latest_file_id = None

        return {"message": "All PDFs and ChromaDB embeddings deleted successfully"}

    except Exception as e:
        return {"error": f"Delete failed: {str(e)}"}
