from pydantic import BaseModel


class LLMRequestModel(BaseModel):
  prompt: str