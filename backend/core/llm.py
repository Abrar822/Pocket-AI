import requests
import json
from .system_prompt import system_prompt


def route_task(prompt: str):
    response = requests.post(
        "http://127.0.0.1:8080/chat/completions",
        json={
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 2048,
        },
    )
    route = response.json()
    return json.loads(route['choices'][0]['message']['content'])