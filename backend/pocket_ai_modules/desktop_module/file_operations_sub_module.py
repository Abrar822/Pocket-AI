class FileOperationsSubModule:

    def __init__(self):
        self.actions = {
            "create_file": self.create_file,
            "create_folder": self.create_folder,
            "open_file_folder": self.open_file_folder,
            "delete_file_folder": self.delete_file_folder,
            "rename_file_folder": self.rename_file_folder,
            "close_file": self.close_file,
        }

    def create_file(self, task):
        print("File Created")

    def create_folder(self, task):
        print("Folder created")

    def open_file_folder(self, task):
        print("File/Folder opened")

    def delete_file_folder(self, task):
        print("Deleted file/folder")

    def rename_file_folder(self, task):
        print("Renamed file/folder")

    def close_file(self, task):
        print("Closed file")

    def execute(self, task):
        action = self.actions.get(task.action)
        if action:
            action(task)
