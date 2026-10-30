import pyautogui
from datetime import datetime
from pathlib import Path
import os
import time

class ScreenshotSubModule:

    def take_screenshot(self, task):
        print("screen")
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        path = Path.home() / "Downloads" / f"screenshot_{timestamp}.png"
        time.sleep(2) 
        ss = pyautogui.screenshot()
        ss.save(path)
        os.startfile(path)
        return f"Screenshot saved in Downloads folder successfully."
