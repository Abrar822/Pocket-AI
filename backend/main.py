from .pydantic_models.task_router_models import TaskRouterResponse
from .pydantic_models.llm_models.llm_models import LLMRequestModel
from .pocket_ai_modules.text_to_speech_module.Piper_TTS import tts
from .core.TaskRouter import TaskRouter
from fastapi import FastAPI
from .core.llm import route_task

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

app = FastAPI()
speaker = tts.TextToSpeechModule()
ai = TaskRouter()


# Endpoint to generate the response from llm after receiving the prompt
# Run Qwen:=> .\backend\core\llama_cpp\llama-server.exe -m ".\backend\core\model\qwen2.5-1.5b-instruct-q4_k_m.gguf" -c 4096
@app.post("/prompt")
def generate_response(request: LLMRequestModel):
    try:
        data = route_task(request.prompt)
        print("Data returned by llm", data)

        data = TaskRouterResponse.model_validate(data)

        speaker.tts(data.response)

        ai.execute(data.tasks)

    except Exception as err:
        speaker.tts("Sorry I cannot help with that")
        print(str(err))
