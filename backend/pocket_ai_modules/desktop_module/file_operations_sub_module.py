from pathlib import Path
import os
import shutil
from send2trash import send2trash
from ..persistent_memory.db import get_conn_obj
from fastapi import HTTPException, status
import pygetwindow as gw
from ..persistent_memory.db_operations import move_folder_in_memory, rename_folder_in_memory, delete_folder_from_memory, remove_stale_paths


def search_location(foldername):
    try:
        data = []
        print(search_location)
        conn = get_conn_obj()
        cursor = conn.cursor()
        query = """SELECT * FROM memory WHERE LOWER(f_name) LIKE ?"""
        cursor.execute(query, (f"{foldername.lower()}",))
        print(foldername.lower())
        data = cursor.fetchone()
        return data
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )


def search_in_machine(folder_path):

    folder = Path(folder_path)

    if folder.is_dir():
        print("Folder Exists in machine")
        return folder
    else:
        print("Folder does not exist")
        return None


class FileOperationsSubModule:

    def create_file(self, task):
        file_memory = search_location(task.parameters.foldername)
        print(file_memory)
        if not file_memory:
            return f"Parent Folder not registered in Pocket AI Memory."
        else:
            folder_path = Path(file_memory[2])
            print(folder_path)
            file_machine = search_in_machine(folder_path)
            if not file_machine:
                return f"Parent Folder not found inside the machine."
            file_path = file_machine / task.parameters.filename
            print(file_path)
            if file_path.is_file():
                return f"File already exists."
            else:
                try:
                    Path(file_path).touch(exist_ok=True)
                    file_path.write_text(task.parameters.content, encoding="utf-8")
                    return f"File created successfully."
                except PermissionError:
                    return "File creation not permitted."

    def create_folder(self, task):
        par_folder_in_memory = search_location(task.parameters.parent_foldername)
        print(par_folder_in_memory)
        if not par_folder_in_memory:
            return f"Parent Folder {par_folder_in_memory} not registered in Pocket AI Memory."
        else:
            parent_path = Path(par_folder_in_memory[2])
            print(parent_path)
            par_folder_in_machine = search_in_machine(parent_path)
            if not par_folder_in_machine:
                return f"Parent Folder not found inside the machine."
            print(par_folder_in_machine)
            child_path = par_folder_in_machine / task.parameters.folder_to_be_created
            print(child_path)
            if child_path.is_dir():
                return f"Folder already exists."
            else:
                try:
                    Path(child_path).mkdir(parents=True, exist_ok=True)
                    return "Folder created successfully."
                except PermissionError:
                    return "Folder creation not permitted."

    def open_file(self, task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f"Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory."
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return f"Parent Folder not found inside the machine."

            file_path = folder_in_machine / task.parameters.filename
            try:
                if file_path.is_file():
                    print("file exists in parent folder")
                    os.startfile(file_path)
                    return "File Opened successfully."
                else:
                    print("file not exists in parent folder")
                    return "File not found inside the folder."
            except PermissionError:
                return "File Opening not permitted."

    def open_folder(self, task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f"Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory."
        else:
            folder_path = Path(folder_in_memory[2])
            print(folder_path)
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return "Parent Folder not found inside the machine."
            print(folder_in_machine)
            child_path = folder_in_machine / task.parameters.folder_to_be_opened
            print(child_path)
            if child_path.is_dir():
                print("given folder exists in parent folder")
                os.startfile(child_path)
                return "Folder opened successfully."
            else:
                return "Child folder does not exist."

    def delete_file(self, task):
        folder_in_memory = search_location(task.parameters.foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f"Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory."
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return "Parent Folder not found inside the machine."
            file_path = folder_in_machine / task.parameters.filename
            print(file_path)
            if file_path.is_file():
                try:
                    print("File exists in parent folder")
                    send2trash(file_path)
                    return "File deleted successfully."
                except PermissionError:
                    print("Permission denied")
                    return "File Deletion not permitted."
                except Exception as e:
                    print(f"Error deleting file: {e}")
                    return "Some Error occurred."
            else:
                print("File does not exists in parent folder")
                return "File does not exist in parent folder."

    def delete_folder(self, task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f"Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory."
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return "Parent Folder not found inside the machine."
            child_path = folder_in_machine / task.parameters.folder_to_be_deleted
            print(child_path)
            if child_path.is_dir():
                try:
                    print("Folder exists in parent folder")
                    send2trash(child_path)
                    res = delete_folder_from_memory(task.parameters.folder_to_be_deleted)
                    msg = "Folder deleted successfully."
                    if res:
                        msg += ' ' + res
                    print("Folder deleted successfully")
                    remove_stale_paths()
                    return msg
                except PermissionError:
                    print("Permission denied")
                    return "Folder Deletion not permitted."
                except Exception as e:
                    print(f"Error deleting folder: {e}")
                    return "Some Error occurred."
            else:
                print("Folder does not exists in parent folder")
                return "Child folder does not exist inside parent folder."

    def rename_file(self, task):
        folder_in_memory = search_location(task.parameters.foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f"Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory."
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return "Parent Folder not found inside the machine."
            file_path = folder_in_machine / task.parameters.old_filename
            print(file_path)
            if file_path.is_file():
                try:
                    print("File exists in parent folder")
                    new_file_path = file_path.with_name(task.parameters.new_filename)
                    if new_file_path.exists():
                        print("File with new name already exists")
                        return "File with new name already exists."
                    file_path.rename(new_file_path)
                    print("File renamed successfully")
                    return "File renamed successfully."
                except PermissionError:
                    print("Permission denied")
                    return "File renamed not permitted"
                except Exception as e:
                    print(f"Error renaming file: {e}")
                    return "Some Error occurred."
            else:
                print("File does not exists in parent folder")
                return "File does not exist in parent folder."

    def rename_folder(self, task):
        folder_in_memory = search_location(task.parameters.parent_foldername)
        print(folder_in_memory)
        if not folder_in_memory:
            return f"Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory."
        else:
            folder_path = Path(folder_in_memory[2])
            folder_in_machine = search_in_machine(folder_path)
            if not folder_in_machine:
                return "Parent Folder not found inside the machine."
            child_path = folder_in_machine / task.parameters.old_foldername
            print(child_path)
            if child_path.is_dir():
                try:
                    print("Given Folder exists in parent folder")
                    new_child_path = child_path.with_name(
                        task.parameters.new_foldername
                    )
                    if new_child_path.exists():
                        print("Folder with new name already exists")
                        return "Folder with new name already exists."
                    child_path.rename(new_child_path)
                    msg = "Folder renamed successfully."
                    res = rename_folder_in_memory(task.parameters.old_foldername, task.parameters.new_foldername, str(new_child_path))
                    if res:
                        msg += ' ' + res
                    print("Folder renamed successfully")
                    return msg
                except PermissionError:
                    print("Permission denied")
                    return "Folder renamed not permitted"
                except Exception as e:
                    print(f"Error renaming folder: {e}")
                    return "Some Error occurred."
            else:
                print("Folder does not exists in parent folder")
                return "Folder does not exist in parent folder."

    def close_file(self, task):
        filename = task.parameters.filename
        for window in gw.getAllWindows():
            if filename.lower() in window.title.lower():
                window.close()
                return "file closed successfully."
        return "file is already closed."

    
    def move_file(self, task):
        try:
            file1 = search_location(task.parameters.parent_foldername)
            file2 = search_location(task.parameters.destination_foldername)

            if not file1:
                return f"Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory."

            if not file2:
                return f"Destination Folder {task.parameters.destination_foldername} not registered in Pocket AI Memory."

            parent_path = Path(file1[2])
            destination_path = Path(file2[2])

            parent_machine = search_in_machine(parent_path)
            if not parent_machine:
                return "Parent Folder not found inside the machine."

            destination_machine = search_in_machine(destination_path)
            if not destination_machine:
                return "Destination Folder not found inside the machine."

            source_file = parent_machine / task.parameters.filename_to_be_moved
            print("SOURCE:", source_file)

            if not source_file.exists():
                return "File does not exist in parent folder."

            if not source_file.is_file():
                return "The specified item is not a file."

            destination_file = destination_machine / source_file.name
            print("DESTINATION:", destination_file)

            if destination_file.exists():
                return "File with the same name already exists in destination folder."

            shutil.move(str(source_file), str(destination_machine))

            print("File moved successfully.")

            return "File moved successfully."

        except PermissionError:
            print("Permission denied while moving file.")
            return "Moving file not permitted due to insufficient permissions."

        except OSError as e:
            print(f"OS error while moving file: {e}")
            return "An operating system error occurred while moving the file."

        except Exception as e:
            print(f"Error moving file: {e}")
            return "Some error occurred while moving the file."


    
    def move_folder(self, task):
        try:
            file1 = search_location(task.parameters.parent_foldername)
            file2 = search_location(task.parameters.destination_foldername)

            if not file1:
                return f"Parent Folder {task.parameters.parent_foldername} not registered in Pocket AI Memory."

            if not file2:
                return f"Destination Folder {task.parameters.destination_foldername} not registered in Pocket AI Memory."

            parent_path = Path(file1[2])
            destination_path = Path(file2[2])

            parent_machine = search_in_machine(parent_path)
            if not parent_machine:
                return "Parent Folder not found inside the machine."

            destination_machine = search_in_machine(destination_path)
            if not destination_machine:
                return "Destination Folder not found inside the machine."

            source_folder = parent_machine / task.parameters.folder_to_be_moved
            print("SOURCE:", source_folder)

            if not source_folder.exists():
                return "Folder does not exist in parent folder."

            if not source_folder.is_dir():
                return "The specified item is not a folder."

            destination_folder = destination_machine / source_folder.name
            print("DESTINATION:", destination_folder)

            if destination_folder.exists():
                return "Folder with the same name already exists in destination folder."

            # Prevent moving a folder into itself or one of its descendants.
            if destination_machine == source_folder or source_folder in destination_machine.parents:
                return "Cannot move a folder into itself or one of its subfolders."

            shutil.move(str(source_folder), str(destination_machine))

            print("Folder moved successfully.")

            msg = "Folder moved successfully."
            res = move_folder_in_memory(
                task.parameters.folder_to_be_moved,
                str(destination_folder)
            )

            if res:
                msg += " " + res

            return msg

        except PermissionError:
            print("Permission denied while moving folder.")
            return "Moving folder not permitted due to insufficient permissions."

        except OSError as e:
            print(f"OS error while moving folder: {e}")
            return "An operating system error occurred while moving the folder."

        except Exception as e:
            print(f"Error moving folder: {e}")
            return "Some error occurred while moving the folder."
