from ..pocket_ai_modules.desktop_module.desktop_module import DesktopModule
from ..pocket_ai_modules.browser_module.browser_module import BrowserModule
from ..pocket_ai_modules.email_generation_module.email_generation_module import (
    EmailGenerationModule,
)
from ..pocket_ai_modules.pdf_assistant_module.pdf_assistant_module import (
    PdfAssistantModule,
)


class TaskRouter:
    def __init__(self):
        self.desktop = DesktopModule()
        self.browser = BrowserModule()
        self.email = EmailGenerationModule()
        self.pdf = PdfAssistantModule()
        self.modules = {
            "desktop": self.desktop,
            "browser": self.browser,
            "email": self.email,
            "pdf": self.pdf,
        }

    def execute(self, tasks):
        for task in tasks:
            module = self.modules.get(task.module)
            if module:
                module.execute(task)
