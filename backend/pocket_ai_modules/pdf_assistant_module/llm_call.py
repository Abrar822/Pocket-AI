# import requests

# def llm_call(prompt: str):
#     system_prompt = """
#     You are a PDF-based RAG assistant. Answer the user's query using only the provided PDF context. If the answer is not present in the context, say "I couldn't find this information in the PDF." Do not invent or assume information. Keep answers clear and concise.
#     """
    
#     response = requests.post(
#         "http://127.0.0.1:8080/chat/completions",
#         json={
#             "messages": [
#                 {"role": "system", "content": system_prompt},
#                 {"role": "user", "content": prompt},
#             ],
#             "temperature": 0.2,
#             "max_tokens": 2048,
#         },
#     )
#     data = response.json()
#     return data

# llm_call.py

import requests

from pydantic import Field
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
)
from langchain_core.outputs import ChatResult, ChatGeneration


class LocalChatLLM(BaseChatModel):
    endpoint: str = Field(
        default="http://127.0.0.1:8080/chat/completions"
    )

    @property
    def _llm_type(self) -> str:
        return "local-chat-llm"

    def _generate(
        self,
        messages,
        stop=None,
        run_manager=None,
        **kwargs,
    ) -> ChatResult:

        # Preserve the roles created by ChatPromptTemplate
        api_messages = []

        for message in messages:
            if isinstance(message, SystemMessage):
                role = "system"
            elif isinstance(message, HumanMessage):
                role = "user"
            elif isinstance(message, AIMessage):
                role = "assistant"
            else:
                role = "user"

            api_messages.append({
                "role": role,
                "content": message.content,
            })

        response = requests.post(
            self.endpoint,
            json={
                "messages": api_messages,
                "temperature": 0.2,
                "max_tokens": 2048,
            },
            timeout=120,
        )

        response.raise_for_status()
        data = response.json()

        answer = data["choices"][0]["message"]["content"]

        if stop:
            for token in stop:
                if token in answer:
                    answer = answer.split(token)[0]

        return ChatResult(
            generations=[
                ChatGeneration(
                    message=AIMessage(content=answer)
                )
            ]
        )

# # Initialize your local model
# llm = LocalChatLLM()

# # Test the connection
# print(llm.invoke("Explain machine learning briefly.").content)