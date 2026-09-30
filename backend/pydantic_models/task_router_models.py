from .browser_models import BrowserTask
from .desktop_models import DeskTopTask
from .email_generation_models import EmailGenerationTask

from pydantic import BaseModel, Field
from typing import Annotated

Task = Annotated[
    BrowserTask | DeskTopTask | EmailGenerationTask ,
    Field(discriminator="module"),
]


class TaskRouterResponse(BaseModel):
    response: str
    tasks: list[Task]