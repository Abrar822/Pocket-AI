from .. persistent_memory.memory_endpoints import search_location
from pathlib import Path
import os
import shutil
from send2trash import send2trash

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
        if not file_memory:
            return f'Parent Folder not registered in Pocket AI Memory.'
        else:
            folder_path = Path(file_memory[2])
            print(folder_path)
            file_machine = search_in_machine(folder_path)
            if not file_machine:
                return f'Parent Folder not found inside the machine.'
            file_path = file_machine / task.parameters.filename
            print(file_path)
            if file_path.is_file():
                return f'File already exists.'
            else : 
                try:
                    Path(file_path).touch(exist_ok=True)
                    file_path.write_text(task.parameters.content, encoding="utf-8")
                    return f'File created successfully.'
                except PermissionError:
                    return 'File creation not permitted.'
                

    def create_folder(self,task):
        par_folder_in_memory = search_location(task.parameters.parent_foldername)
        print(par_folder_in_memory)
        if not par_folder_in_memory:
            return f'Parent Folder {par_folder_in_memory} not registered in Pocket AI Memory.'
        else:
            parent_path = Path(par_folder_in_memory[2])
            print(parent_path)
            par_folder_in_machine = search_in_machine(parent_path)
            if not par_folder_in_machine:
                return f'Parent Folder not found inside the machine.'
            print(par_folder_in_machine)
            child_path = par_folder_in_machine / task.parameters.folder_to_be_created
            print(child_path)
            if child_path.is_dir():
                return f'Folder already exists.'
            else:
                try:
                    Path(child_path).mkdir(parents=True,exist_ok=True)
                    return 'Folder created successfully.'
                except PermissionError:
                    return 'Folder creation not permitted.'


    def open_file(self,task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f'Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory.'
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return f'Parent Folder not found inside the machine.'
            
            file_path = folder_in_machine / task.parameters.filename
            try:
                if file_path.is_file():
                    print("file exists in parent folder")
                    os.startfile(file_path)
                    return 'File Opened successfully.'
                else:
                    print("file not exists in parent folder")
                    return 'File not found inside the folder.'
            except PermissionError:
                return 'File Opening not permitted.'


    def open_folder(self,task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f'Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory.'
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return 'Parent Folder not found inside the machine.'
            child_path = folder_in_machine / task.parameters.folder_to_be_opened
            if child_path.is_dir():
                print("given folder exists in parent folder")
                os.startfile(child_path)
                return 'Folder opened successfully.'
            else:
                return 'Child folder does not exist.'


    def delete_file(self, task):
        folder_in_memory = search_location(task.parameters.foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f'Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory.'
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return 'Parent Folder not found inside the machine.'
            file_path = folder_in_machine / task.parameters.filename
            print(file_path)
            if file_path.is_file():
                try:
                    print("File exists in parent folder")
                    # file_path.unlink()
                    send2trash(file_path)
                    return 'File deleted successfully.'
                    # print("File deleted successfully")
                except PermissionError:
                    print("Permission denied")
                    return 'File Deletion not permitted.'
                except Exception as e:
                    print(f"Error deleting file: {e}")
                    return 'Some Error occurred.'
            else:
                print("File does not exists in parent folder")
                return 'File does not exist in parent folder.'

    def delete_folder(self, task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f'Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory.'
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return 'Parent Folder not found inside the machine.'
            child_path = folder_in_machine / task.parameters.folder_to_be_deleted
            print(child_path)
            if child_path.is_dir():
                try:
                    print("Folder exists in parent folder")
                    # shutil.rmtree(child_path)
                    send2trash(child_path)
                    print("Folder deleted successfully")
                    return 'Folder deleted successfully.'
                except PermissionError:
                    print("Permission denied")
                    return 'Folder Deletion not permitted.'
                except Exception as e:
                    print(f"Error deleting folder: {e}")
                    return 'Some Error occurred.'
            else:
                print("Folder does not exists in parent folder")
                return 'Child folder does not exist inside parent folder.'

    def rename_file(self, task):
        folder_in_memory = search_location(task.parameters.foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f'Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory.'
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return 'Parent Folder not found inside the machine.'
            file_path = folder_in_machine / task.parameters.old_filename
            print(file_path)
            if file_path.is_file():
                try:
                    print("File exists in parent folder")
                    new_file_path = file_path.with_name(task.parameters.new_filename)
                    if new_file_path.exists():
                        print('File with new name already exists')
                        return 'File with new name already exists.'
                    file_path.rename(new_file_path)
                    print("File renamed successfully")
                    return 'File renamed successfully.'
                except PermissionError:
                    print("Permission denied")
                    return 'File renamed not permitted'
                except Exception as e:
                    print(f"Error renaming file: {e}")
                    return 'Some Error occurred.'
            else:
                print("File does not exists in parent folder")    
                return 'File does not exist in parent folder.'    

    def rename_folder(self, task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f'Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory.'
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return 'Parent Folder not found inside the machine.'
            child_path = folder_in_machine / task.parameters.old_foldername
            print(child_path)
            if child_path.is_dir():
                try:
                    print("Given Folder exists in parent folder")
                    new_child_path = child_path.with_name(task.parameters.new_foldername)
                    if new_child_path.exists():
                        print("Folder with new name already exists")
                        return 'Folder with new name already exists.'
                    child_path.rename(new_child_path)
                    print("Folder renamed successfully")
                    return 'Folder renamed successfully.'
                except PermissionError:
                    print("Permission denied")
                    return 'Folder renamed not permitted'
                except Exception as e:
                    print(f"Error renaming folder: {e}")
                    return 'Some Error occurred.'
            else:
                print("Folder does not exists in parent folder")
                return 'Folder does not exist in parent folder.'

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
# f.delete_file("ET23BTCO045","het.txt")
# f.delete_folder("ET23BTCO045","het")
