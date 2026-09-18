from pydantic import BaseModel, Field
from typing import Literal, Annotated


class NoParams(BaseModel):
    pass


class Conversation(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["conversation"]
    parameters: NoParams


class SetVolumeParams(BaseModel):
    level: int


class SetVolume(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["set_volume"]
    parameters: SetVolumeParams


class SetBrightnessParams(BaseModel):
    level: int


class SetBrightness(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["set_brightness"]
    parameters: SetBrightnessParams


class Shutdown(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["shutdown"]
    parameters: NoParams


class Restart(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["restart"]
    parameters: NoParams


class Lock(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["lock"]
    parameters: NoParams


class Sleep(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["sleep"]
    parameters: NoParams


class Hibernate(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["hibernate"]
    parameters: NoParams


class TakeScreenshot(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["take_screenshot"]
    parameters: NoParams


class CreateFolderParams(BaseModel):
    parent_foldername: str
    folder_to_be_created: str


class CreateFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["create_folder"]
    parameters: CreateFolderParams


class CreateFileParams(BaseModel):
    foldername: str
    filename: str
    content: str


class CreateFile(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["create_file"]
    parameters: CreateFileParams


class OpenFileParams(BaseModel):
    parent_foldername: str
    filename: str


class OpenFile(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["open_file"]
    parameters: OpenFileParams


class OpenFolderParams(BaseModel):
    parent_foldername: str
    folder_to_be_opened: str


class OpenFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["open_folder"]
    parameters: OpenFolderParams


class DeleteFileParams(BaseModel):
    foldername: str
    filename: str


class DeleteFile(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["delete_file"]
    parameters: DeleteFileParams


class DeleteFolderParams(BaseModel):
    parent_foldername: str
    folder_to_be_deleted: str


class DeleteFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["delete_folder"]
    parameters: DeleteFolderParams


class RenameFileParams(BaseModel):
    foldername: str
    old_filename: str
    new_filename: str


class RenameFile(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["rename_file"]
    parameters: RenameFileParams


class RenameFolderParams(BaseModel):
    parent_foldername: str
    old_foldername: str
    new_foldername: str


class RenameFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["rename_folder"]
    parameters: RenameFolderParams


class CloseFileParams(BaseModel):
    filename: str


class MoveFileParams(BaseModel):
    parent_foldername: str
    filename_to_be_moved: str
    destination_foldername: str


class MoveFile(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["move_file"]
    parameters: MoveFileParams


class MoveFolderParams(BaseModel):
    parent_foldername: str
    folder_to_be_moved: str
    destination_foldername: str


class MoveFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["move_folder"]
    parameters: MoveFolderParams


class CloseFile(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["close_file"]
    parameters: CloseFileParams


class OpenAppParams(BaseModel):
    official_app_name: str


class OpenApp(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["open_app"]
    parameters: OpenAppParams


DeskTopTask = Annotated[
    SetVolume
    | SetBrightness
    | Shutdown
    | Restart
    | Lock
    | Sleep
    | Hibernate
    | TakeScreenshot
    | CreateFolder
    | CreateFile
    | OpenFile
    | OpenFolder
    | DeleteFile
    | DeleteFolder
    | RenameFile
    | RenameFolder
    | MoveFolder
    | MoveFile
    | OpenApp
    | Conversation,
    Field(discriminator="action"),
]
