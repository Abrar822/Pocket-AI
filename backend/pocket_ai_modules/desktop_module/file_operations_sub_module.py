from .. persistent_memory.memory_endpoints import search_location
from pathlib import Path
import os

def search_in_machine(folder_path):
    
    folder = Path(folder_path)

    if folder.is_dir():
        print("Folder Exists in machine")
        return folder
    else:
        print("Folder does not exist")
        return None


class FileOperationsSubModule:

    # def __init__(self):
    #     self.actions = {
    #         "create_file": self.create_file,
    #         "create_folder": self.create_folder,
    #         "open_file": self.open_file,
    #         "open_folder": self.open_folder,
    #         "delete_file": self.delete_file,
    #         "delete_folder": self.delete_folder,
    #         "rename_file": self.rename_file,
    #         "rename_folder": self.rename_folder,
    #         "close_file": self.close_file,
    #         "move_file": self.move_file,
    #         "move_folder": self.move_folder
    #     }

    def create_file(self,task):
        # first=> check if the parentfolder exist in db and in machine
        # if not =>  tell user not registered or exist on machine
        # else check newfolder exist
        # if not exist then create
        # else tell user already exist
        file_memory = search_location(task.parameters.foldername)
        print(file_memory)
        if file_memory == None:
            print("file don't exists in memory")
            return None
        else:
            folder_path = Path(file_memory[2])
            print(folder_path)
            file_machine = search_in_machine(folder_path)
            file_path = file_machine / task.parameters.filename
            print(file_path)
            if file_path.is_file():
                print("file already exists")
                return None
            else : 
                Path(file_path).touch(exist_ok=True)
                file_path.write_text(task.parameters.content, encoding="utf-8")
                print("file created")
                

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
        print("Closed file")

    def move_file(self, task):
        print('moved file')

    def move_folder(self, task):
        print('moved folder')

    # def execute(self, task):
    #     action = self.actions.get(task.action)
    #     if action:
    #         return action(task)
        
f = FileOperationsSubModule()
# f.create_file("demo","het.txt","my name is het tejani i am Btech computer enginnering student from scet")
# f.create_folder("demo","het") 
# f.open_file("demo","het.txt")   
# f.open_folder("demo","het")   
# f.close_file("demo","het.txt")   


