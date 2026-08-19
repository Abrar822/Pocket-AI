from fastapi import APIRouter, Request
from ..core.llm import route_task
from ..pydantic_models.task_router_models import TaskRouterResponse
from ..pydantic_models.llm_models.llm_models import LLMRequestModel

llm_prompt_router = APIRouter()

# Endpoint to generate the response from llm after receiving the prompt
@llm_prompt_router.post("/prompt")
def generate_response(request: LLMRequestModel, req: Request):
    try:
        data = route_task(request.prompt)
        print("Data returned by llm", data)

        data = TaskRouterResponse.model_validate(data)

        req.app.state.speaker.tts(data.response)

        req.app.state.ai.execute(data.tasks)

        return {"response": data.response}

    except Exception as err:
        req.app.state.speaker.tts("Sorry I cannot help with that")
        print(str(err))
        return {"response": "Sorry I cannot help with that"}