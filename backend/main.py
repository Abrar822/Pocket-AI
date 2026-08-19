# Endpoint to generate the response from llm after receiving the prompt
# Run Qwen:=> .\backend\core\llama_cpp\llama-server.exe -m ".\backend\core\model\qwen2.5-1.5b-instruct-q4_k_m.gguf" -c 4096

# data = {
#     "response": "Email is being generated, pls dont press any key sir",
#     "tasks": [
#         {
#             "id": 1,
#             "module": "browser",
#             "action": "search_specific_website",
#             "parameters": {"website_name": "youtube", "query": "Abrar Shekh"},
#         }
#     ],
# }

from fastapi.middleware.cors import CORSMiddleware
from .pocket_ai_modules.text_to_speech_module.Piper_TTS import tts
from .core.TaskRouter import TaskRouter
from fastapi import FastAPI
from .pocket_ai_modules.persistent_memory.db import db
from .core.llm_prompt_endpoint import llm_prompt_router
from .pocket_ai_modules.persistent_memory.memory_endpoints import memory_endpoints

app = FastAPI()
ai = TaskRouter()
speaker = tts.TextToSpeechModule()
db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(llm_prompt_router)
app.include_router(memory_endpoints)
