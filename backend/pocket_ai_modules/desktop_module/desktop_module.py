from backend.pocket_ai_modules.desktop_module.power_sub_module import PowerSubModule
from backend.pocket_ai_modules.desktop_module.file_operations_sub_module import (
    FileOperationsSubModule,
)
from backend.pocket_ai_modules.desktop_module.screenshot_sub_module import (
    ScreenshotSubModule,
)

import screen_brightness_control as sbc
from pycaw.pycaw import AudioUtilities
import pythoncom


class DesktopModule:

    def __init__(self):
        self.power = PowerSubModule()
        self.file = FileOperationsSubModule()
        self.screenshot = ScreenshotSubModule()

        self.actions = {
            "set_volume": self.set_volume,
            "set_brightness": self.set_brightness,
            "shutdown": self.power.execute,
            "restart": self.power.execute,
            "lock": self.power.execute,
            "sleep": self.power.execute,
            "hibernate": self.power.execute,
            "take_screenshot_without_path": self.screenshot.execute,
            "take_screenshot_with_path": self.screenshot.execute,
            "create_file": self.file.execute,
            "create_folder": self.file.execute,
            "open_file_folder": self.file.execute,
            "delete_file_folder": self.file.execute,
            "rename_file_folder": self.file.execute,
            "close_file": self.file.execute,
            "no_task": self.no_task,
            "conversation": self.conversation
        }

    def no_task(self, task):
        pass

    def conversation(self, task):
        pass

    def set_volume(self, task):
        pythoncom.CoInitialize()
        level = task.parameters.level
        if level < 0:
            level = 10
        elif level > 100:
            level = 100

        device = AudioUtilities.GetSpeakers()
        volume = device.EndpointVolume
        volume.SetMute(False, None)
        volume.SetMasterVolumeLevelScalar(level / 100.0, None)
        pythoncom.CoUninitialize()

    def set_brightness(self, task):
        level = task.parameters.level
        level = max(0, min(level, 100))

        sbc.set_brightness(level)

    def execute(self, task):
        action = self.actions.get(task.action)
        if action:
            action(task)
