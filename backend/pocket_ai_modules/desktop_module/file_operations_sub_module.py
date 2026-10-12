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
            print(folder_path)
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return 'Parent Folder not found inside the machine.'
            print(folder_in_machine)
            child_path = folder_in_machine / task.parameters.folder_to_be_opened
            print(child_path)
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
        filename = task.parameters.filename
        for window in gw.getAllWindows():
            if filename.lower() in window.title.lower():
                window.close()
                return "file closed successfully"
        return "file is already close"


    def move_file(self, task):
        file1 = search_location(task.parameters.parent_foldername)
        print(file1)
        file2 = search_location(task.parameters.destination_foldername)
        print(file2)
        if file1 is None or  file2 is None:
            print("file don't exists in memory")
        else:
            file_path_1 = Path(file1[2])
            print(file_path_1)
            file_path_2 = Path(file2[2])
            print(file_path_2)
            file_machine_1 = search_in_machine(file_path_1)
            file_path_1 = file_machine_1 / task.parameters.filename_to_be_moved
            print(file_path_1)
            file_machine_2 = search_in_machine(file_path_2)
            file_path_2 = file_machine_2
            print(file_path_2)
            file_path_3 = file_path_2 / task.parameters.filename_to_be_moved
            print("SOURCE:", file_path_1)
            print("EXISTS:", file_path_1.exists())
            print("IS FILE:", file_path_1.is_file())
            if file_path_1.is_file():
                print("file is exist in parent folder")
            else:
                print("file doesn't exist in parent folder")
                return None
            if file_path_3.is_file():
                print("file already exists in destination folder")
                return None
            shutil.move(str(file_path_1),str(file_path_2))
            print("file moved successfully")
            return file_path_2
            



    def move_folder(self, task):
        file1 = search_location(task.parameters.parent_foldername)
        print(file1)
        file2 = search_location(task.parameters.destination_foldername)
        print(file2)
        if file1 is None or  file2 is None:
            print("file don't exists in memory")
        else:
            file_path_1 = Path(file1[2])
            print(file_path_1)
            file_path_2 = Path(file2[2])
            print(file_path_2)
            file_machine_1 = search_in_machine(file_path_1)
            file_path_1 = file_machine_1 / task.parameters.folder_to_be_moved
            print(file_path_1)
            file_machine_2 = search_in_machine(file_path_2)
            file_path_2 = file_machine_2
            print(file_path_2)
            file_path_3 = file_path_2 / task.parameters.folder_to_be_moved
            print("SOURCE:", file_path_1)
            print("EXISTS:", file_path_1.exists())
            if file_path_1.is_dir():
                print("folder is exist in parent folder")
            else:
                print("folder doesn't exist in parent folder")
                return None
            if file_path_3.exists():
                print("folder already exists in destination folder")
                return None
            shutil.move(str(file_path_1),str(file_path_2))
            print("folder moved successfully")
            return file_path_3

    # def execute(self, task):
    #     action = self.actions.get(task.action)
    #     if action:
    #         return action(task)
        
# f = FileOperationsSubModule()
# f.create_file("demo","het.txt","my name is het tejani i am Btech computer enginnering student from scet")
# f.create_folder("demo","het") 
# f.open_file("demo","het.txt")   
# f.open_folder("demo","het")   
# f.close_file("demo","het.txt")   
# f.delete_file("ET23BTCO045","het.txt")
# f.delete_folder("ET23BTCO045","het")
