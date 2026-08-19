from pydantic import BaseModel, Field
from typing import Literal, Annotated


class DummyParams(BaseModel):
    dum: str


class Dummy(BaseModel):
    id: int
    module: Literal["pdf"]
    action: Literal["pdf_assist"]
    parameters: DummyParams


PdfAssistantTask = Annotated[Dummy, Field(discriminator="action")]
