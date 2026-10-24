import requests
from ...core.hardcoded_url import LLM_BASE_URL

def llm_call(prompt: str):
    system_prompt = """
    You are a PDF-based RAG assistant. Answer the user's query using only the provided PDF context. If the answer is not present in the context, say "I couldn't find this information in the PDF." Do not invent or assume information. Keep answers clear and concise.
    """
    
    response = requests.post(
        f"{LLM_BASE_URL}/chat/completions",
        json={
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 2048,
        },
    )
    data = response.json()
    return data