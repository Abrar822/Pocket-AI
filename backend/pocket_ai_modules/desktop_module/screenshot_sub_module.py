import pyautogui
from datetime import datetime
from pathlib import Path


class ScreenshotSubModule:

    def __init__(self):
        self.actions = {
            "take_screenshot": self.take_screenshot,
        }

    def take_screenshot(self, task):
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        path = Path.home() / "Downloads" / f"screenshot_{timestamp}.png"

        ss = pyautogui.screenshot()
        ss.save(path)

    def execute(self, task):
        action = self.actions.get(task.action)
        if action:
            action(task)
