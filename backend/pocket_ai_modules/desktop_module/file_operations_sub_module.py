class FileOperationsSubModule:

    def __init__(self):
        self.actions = {
            "create_file": self.create_file,
            "create_folder": self.create_folder,
            "open_folder": self.open_folder,
            "open_file": self.open_file,
            "delete_file": self.delete_file,
            "delete_folder": self.delete_folder,
            "rename_file": self.rename_file,
            "rename_folder": self.rename_folder,
            "close_file": self.close_file,
            "move_file": self.move_file,
            "move_folder": self.move_folder
        }

    def create_file(self, task):
        print("File Created")

    def create_folder(self, task):
        print("Folder created")

    def open_file(self, task):
        print("File opened")

    def open_folder(self, task):
        print("Folder opened")

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

    def execute(self, task):
        action = self.actions.get(task.action)
        if action:
            return action(task)
