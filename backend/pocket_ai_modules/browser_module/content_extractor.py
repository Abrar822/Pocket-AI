import requests
from .browser_system_prompt import system_prompt


def generate_content(prompt: str):
    response = requests.post(
        "http://127.0.0.1:8080/chat/completions",
        json={
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.6,
            "max_tokens": 2048,
        },
    )
    data = response.json()
    return data["choices"][0]["message"]["content"]
