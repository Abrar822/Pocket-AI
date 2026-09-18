from fastapi import APIRouter, Depends, status, HTTPException
from ...pydantic_models.persistent_memory_module.persistent_memory_models import (
    SearchLocation,
    FolderTraversalDetails,
    DeleteData,
)
from pathlib import Path
from .db import get_connection

memory_endpoints = APIRouter()


# To search for a location
@memory_endpoints.post("/search", status_code=status.HTTP_200_OK)
def search_location(search_location: SearchLocation, conn=Depends(get_connection)):
    try:
        cursor = conn.cursor()
        query = """SELECT * FROM memory WHERE f_name = ?"""
        cursor.execute(query, (search_location.f_name,))
        data = cursor.fetchall()
        return data
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )


# To upsert the locations
@memory_endpoints.post("/insert", status_code=status.HTTP_201_CREATED)
def insert_data(folder_arr: FolderTraversalDetails, conn=Depends(get_connection)):
    folder_paths = folder_arr.folder_locations
    extensions = folder_arr.extensions
    file_details = []

    for path in folder_paths:
        for p in Path(path).rglob('*'):
            p = Path(p)
            if p.is_file() and p.suffix.lower() in extensions:
                file_details.append({'f_name': p.name, 'location': str(p)})

    try:
        query = """
        INSERT INTO memory (f_name, location) VALUES (?, ?) 
        ON CONFLICT (f_name)
        DO UPDATE SET location = excluded.location
        """
        conn.executemany(query, [(row['f_name'], row['location']) for row in file_details])
        conn.commit()
        return {"message": "Successfully inserted/updated locations"}
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )


# To display all locations
@memory_endpoints.get("/display", status_code=status.HTTP_200_OK)
def display(conn=Depends(get_connection)):
    try:
        query = """
        SELECT * FROM memory
        """
        cursor = conn.cursor()
        cursor.execute(query)
        data = cursor.fetchall()
        print(data)
        return data
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )


# To delete the particular f_name entry
@memory_endpoints.delete("/delete", status_code=status.HTTP_200_OK)
def delete(delete_f_name: list[DeleteData], conn=Depends(get_connection)):
    try:
        query = """
        DELETE FROM memory where f_name = ?
        """
        conn.executemany(query, [(dic.f_name,) for dic in delete_f_name])   
        conn.commit()
        return {"message": "Deleted locations successfully"}
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )
