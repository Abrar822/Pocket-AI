import pyautogui
from datetime import datetime
from pathlib import Path


class ScreenshotSubModule:

    def take_screenshot(self, task):
        print("screen")
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        path = Path.home() / "Downloads" / f"screenshot_{timestamp}.png"

        ss = pyautogui.screenshot()
        ss.save(path)
        return f"Screenshot saved in Downloads folder successfully."
