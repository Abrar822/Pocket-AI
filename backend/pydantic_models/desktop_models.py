from pydantic import BaseModel, Field
from typing import Literal, Annotated


class NoParams(BaseModel):
    pass

class NoTask(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal['no_task']
    parameters: NoParams

class Conversation(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal['conversation']
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
    path: str
    foldername: str


class CreateFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["create_folder"]
    parameters: CreateFolderParams


class CreateFileParams(BaseModel):
    path: str
    filename: str
    content: str


class CreateFile(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["create_file"]
    parameters: CreateFileParams


class OpenFileFolderParams(BaseModel):
    path: str


class OpenFileFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["open_file_folder"]
    parameters: OpenFileFolderParams


class DeleteFileFolderParams(BaseModel):
    path: str


class DeleteFileFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["delete_file_folder"]
    parameters: DeleteFileFolderParams


class RenameFileFolderParams(BaseModel):
    path: str
    new_name: str


class RenameFileFolder(BaseModel):
    id: int
    module: Literal["desktop"]
    action: Literal["rename_file_folder"]
    parameters: RenameFileFolderParams


class CloseFileParams(BaseModel):
    name: str


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
    | OpenFileFolder
    | DeleteFileFolder
    | RenameFileFolder
    | CloseFile
    | Conversation
    | NoTask
    | OpenApp,
    Field(discriminator="action"),
]
