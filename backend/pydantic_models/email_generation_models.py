from pydantic import BaseModel, Field
from typing import Annotated, Literal


class ComposeEmailParams(BaseModel):
    subject: str
    body: str


class ComposeEmail(BaseModel):
    id: int
    module: Literal["email"]
    action: Literal["compose_email"]
    parameters: ComposeEmailParams


EmailGenerationTask = Annotated[ComposeEmail, Field(discriminator="action")]
