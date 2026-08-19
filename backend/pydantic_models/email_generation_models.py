from pydantic import BaseModel, Field
from typing import Annotated, Literal


class ComposeEmailParams(BaseModel):
    prompt: str


class ComposeEmail(BaseModel):
    id: int
    module: Literal["email"]
    action: Literal["compose_email"]
    parameters: ComposeEmailParams

class MailStructure(BaseModel):
    subject: str
    body: str


EmailGenerationTask = Annotated[ComposeEmail, Field(discriminator="action")]
