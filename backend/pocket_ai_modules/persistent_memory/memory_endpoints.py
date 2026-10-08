from fastapi import APIRouter, Depends, status, HTTPException
from ...pydantic_models.persistent_memory_module.persistent_memory_models import (
    SearchLocation,
    FolderTraversalDetails,
    DeleteData,
)
from pathlib import Path
from .db import get_connection, get_conn_obj

memory_endpoints = APIRouter()

# def find_location(search_location: SearchLocation):
#     conn = get_conn_obj()
#     cursor = conn.cursor()
#     query = """SELECT * FROM memory WHERE LOWER(f_name) LIKE ?"""
#     cursor.execute(query, (f'{search_location.lower()}',))
#     print(search_location.lower())
#     data = cursor.fetchone()
#     return data

# # To search for a location
# @memory_endpoints.post("/search", status_code=status.HTTP_200_OK)
# def search_location(search_location: SearchLocation):
#     try:
#         return find_location(search_location)
#     except Exception as err:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
#         )


@memory_endpoints.post("/search", status_code=status.HTTP_200_OK)
def search_location(search_location: SearchLocation):
    try:
        conn = get_conn_obj()
        cursor = conn.cursor()
        query = """SELECT * FROM memory WHERE LOWER(f_name) LIKE ?"""
        cursor.execute(query, (f"%{search_location.f_name.lower()}%",))
        print(search_location.f_name.lower())
        data = cursor.fetchall()
        data = [{"f_name": d[1], "location": d[2]} for d in data]
        return data
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )


# To upsert the locations
@memory_endpoints.post("/insert", status_code=status.HTTP_201_CREATED)
def insert_data(folder_arr: FolderTraversalDetails, conn=Depends(get_connection)):
    folder_paths = folder_arr.folder_locations
    file_details = []

    try:
        for path in folder_paths:
            if Path(path).is_dir():
                if path.split("\\").pop():
                    foldername = path.split("\\").pop()
                else:
                    foldername = path[0]
                file_details.append({"f_name": foldername, "location": str(path)})
        query = """
        INSERT INTO memory(f_name,location) VALUES (?,?)
        ON CONFLICT (f_name)
        DO UPDATE SET location = excluded.location 
        """
        data = [(d["f_name"], d["location"]) for d in file_details]
        cursor = conn.cursor()
        cursor.executemany(query, data)
        conn.commit()
        return file_details

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
        data = [{'f_name': d[1], 'location': d[2]} for d in data]
        return data
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )


# To delete the particular f_name entry
@memory_endpoints.delete("/delete", status_code=status.HTTP_200_OK)
def delete(delete_f_name: list[DeleteData], conn=Depends(get_connection)):
    try:
        query = """DELETE FROM memory WHERE LOWER(f_name) = ?"""
        # conn.executemany(query, [(dic.f_name,) for dic in delete_f_name])
        # conn.commit()
        cursor = conn.cursor()
        cursor.executemany(
            query, [(f"{dic.f_name.lower()}",) for dic in delete_f_name]
        )
        if cursor.rowcount > 0:
            conn.commit()
            return {"message": "Deleted locations successfully."}
        return {"message": "No folders found."}

    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
        )
