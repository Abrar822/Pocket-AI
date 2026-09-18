from pydantic import BaseModel


class SearchLocation(BaseModel):
    f_name: str


class FolderTraversalDetails(BaseModel):
    folder_locations: list[str]
    extensions: list[str]


class DeleteData(BaseModel):
    f_name: str
