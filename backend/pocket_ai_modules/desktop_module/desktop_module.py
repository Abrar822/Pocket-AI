from backend.pocket_ai_modules.desktop_module.power_sub_module import PowerSubModule
from backend.pocket_ai_modules.desktop_module.file_operations_sub_module import (
    FileOperationsSubModule,
)
from backend.pocket_ai_modules.desktop_module.screenshot_sub_module import (
    ScreenshotSubModule,
)
from backend.pocket_ai_modules.desktop_module.open_app import launch_application

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
            "shutdown": self.power.shutdown,
            "restart": self.power.restart,
            "lock": self.power.lock,
            "sleep": self.power.sleep,
            "hibernate": self.power.hibernate,
            "take_screenshot": self.screenshot.take_screenshot,
            "create_file": self.file.create_file,
            "create_folder": self.file.create_folder,
            "open_file": self.file.open_file,
            "open_folder": self.file.open_folder,
            "delete_file": self.file.delete_file,
            "rename_folder": self.file.rename_folder,
            "delete_folder": self.file.delete_folder,
            "rename_file": self.file.rename_file,
            "close_file": self.file.close_file,
            "open_app": self.open_app,
            "move_file": self.file.move_file,
            "move_folder": self.file.move_folder,
        }

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

    def open_app(self, task):
        launch_application(task.parameters.official_app_name)

    def execute(self, task):
        print("reached desktop")
        action = self.actions.get(task.action)
        if action:
            return action(task)
