from .. persistent_memory.memory_endpoints import search_location
from pathlib import Path
import os
import pygetwindow as gw
# import sys
# sys.coinit_flags = 2
# from pywinauto import Desktop
# import win32gui
# import win32con
# import time
# from pywinauto import Application

def search_in_machine(folder_path):
    
    folder = Path(folder_path)

    if folder.is_dir():
        print("Folder Exists in machine")
        return folder
    else:
        print("Folder does not exist")
        return None

def close_file_window(file_name):
    windows = []

    def callback(hwnd, _):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)

            if file_name.lower() in title.lower():
                windows.append(hwnd)

    win32gui.EnumWindows(callback, None)

    if not windows:
        print(f"No window found for: {file_name}")
        return False

    for hwnd in windows:
        title = win32gui.GetWindowText(hwnd)
        print(f"Closing: {title}")

        # Ask the application to close normally
        win32gui.PostMessage(
            hwnd,
            win32con.WM_CLOSE,
            0,
            0
        )

    return True


class FileOperationsSubModule:

    def create_file(self,task):
        # first=> check if the parentfolder exist in db and in machine
        # if not =>  tell user not registered or exist on machine
        # else check newfolder exist
        # if not exist then create
        # else tell user already exist
        file_memory = search_location(task.parameters.foldername)
        print(file_memory)
        if file_memory == None:
            return "file don't exists in memory"
        else:
            folder_path = Path(file_memory[2])
            print(folder_path)
            file_machine = search_in_machine(folder_path)
            file_path = file_machine / task.parameters.filename
            print(file_path)
            if file_path.is_file():
                return f"file already exists"
            else : 
                Path(file_path).touch(exist_ok=True)
                file_path.write_text(task.parameters.content, encoding="utf-8")
                return f"file created"
                

    def create_folder(self,task):
        par_folder_in_memory = search_location(task.parameters.parent_foldername)
        print(par_folder_in_memory)
        if par_folder_in_memory == None:
            print("parent folder not exists")
            return None
        else:
            parent_path = Path(par_folder_in_memory[2])
            print(parent_path)
            par_folder_in_machine = search_in_machine(parent_path)
            print(par_folder_in_machine)
            child_path = par_folder_in_machine / task.parameters.folder_to_be_created
            print(child_path)
            if child_path.is_dir():
                print("folder exists in parent folder")
                return None
            else:
                Path(child_path).mkdir(parents=True,exist_ok=True)
                print("folder is created")


    def open_file(self,task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if folder_in_memory == None:
            print("folder is not exists")
            return None
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            file_path = folder_in_machine / task.parameters.filename
            if file_path.is_file():
                print("file exists in parent folder")
                os.startfile(file_path)
                print("File opened successfully")
            else:
                print("file not exists in parent folder")
                return None


    def open_folder(self,task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if folder_in_memory == None:
            print("folder is not exists")
            return None
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            child_path = folder_in_machine / task.parameters.folder_to_be_opened
            if child_path.is_dir():
                print("given folder exists in parent folder")
                os.startfile(child_path)
                print("Folder opened successfully")
            else:
                print("given folder not exists in parent folder")
                return None


    def delete_file(self, task):
        print("Deleted file")

    def delete_folder(self, task):
        print("Deleted folder")

    def rename_file(self, task):
        print("Renamed file")

    def rename_folder(self, task):
        print("Renamed folder")


    def close_file(self, task):
        filename = task.parameters.filename.lower()
        for window in gw.getAllWindows():
            if filename in window.title.lower():
                window.close()
                return f"{filename} is closed successfully"
        return "file is already close"
    
    def move_file(self, task):
        print('moved file')

    def move_folder(self, task):
        print('moved folder')

        
# f = FileOperationsSubModule()
# f.create_file("demo","het.txt","my name is het tejani i am Btech computer enginnering student from scet")
# f.create_folder("demo","het") 
# f.open_file("demo","het.txt")   
# f.open_folder("demo","het")   
# f.close_file("het.txt")   


