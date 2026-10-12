from ..pocket_ai_modules.desktop_module.desktop_module import DesktopModule
from ..pocket_ai_modules.browser_module.browser_module import BrowserModule
from ..pocket_ai_modules.email_generation_module.email_generation_module import (
    EmailGenerationModule,
)


class TaskRouter:
    def __init__(self):
        self.desktop = DesktopModule()
        self.browser = BrowserModule()
        self.email = EmailGenerationModule()
        self.modules = {
            "desktop": self.desktop,
            "browser": self.browser,
            "email": self.email,
        }

    def execute(self, tasks):
        print('taskrouter reached')
        result = []
        for task in tasks:
            module = self.modules.get(task.module)
            if module:
                res =  module.execute(task)
                if res:
                    result.append(res)
        return result
