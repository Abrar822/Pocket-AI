from pydantic import BaseModel

class SearchLocation(BaseModel):
    f_name: str

class InsertData(BaseModel):
    f_name: str
    location: str

class DeleteData(BaseModel):
    f_name: str