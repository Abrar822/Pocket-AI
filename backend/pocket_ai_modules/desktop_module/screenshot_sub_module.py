import pyautogui
from datetime import datetime
from pathlib import Path


class ScreenshotSubModule:

    def __init__(self):
        self.actions = {
            "take_screenshot_without_path": self.take_screenshot_without_path,
            "take_screenshot_with_path": self.take_screenshot_with_path,
        }

    def take_screenshot_without_path(self, task):
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        path = Path.home() / "Downloads" / f"screenshot_{timestamp}.png"

        ss = pyautogui.screenshot()
        ss.save(path)

    def take_screenshot_with_path(self, task):
        folder = Path(task.parameters.path)
        folder.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filepath = folder / f"screenshot_{timestamp}.png"

        ss = pyautogui.screenshot()
        ss.save(filepath)

    def execute(self, task):
        action = self.actions.get(task.action)
        if action:
            action(task)
