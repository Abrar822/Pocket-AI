from fastapi import APIRouter, Depends, HTTPException, status
from ...pydantic_models.persistent_memory_module.persistent_memory_models import InsertSettingsDetails
from .db import get_connection

settings_endpoints = APIRouter()


@settings_endpoints.get("/get_user_details", status_code=status.HTTP_200_OK)
def get_user_data(conn=Depends(get_connection)):
    cur = None
    try:
        cur = conn.cursor()
        query = """SELECT * FROM keyval"""
        cur.execute(query)
        data = cur.fetchall()
        print("DATABASE DATA:", data)
        return data
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch details" + str(err),
        )
    finally:
        if cur:
            cur.close()

@settings_endpoints.post('/insert_details', status_code=status.HTTP_201_CREATED)
def insert_details(data: InsertSettingsDetails, conn = Depends(get_connection)):
    cur = None
    try:
        details = {
            'username': data.username,
            'mode': data.mode,
            'wakeword': data.wakeword,
            'voice': data.voice
        }
        details = list(details.items())
        query = """INSERT INTO keyval (key, value) VALUES (?, ?)
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value
        """
        cur = conn.cursor()
        cur.executemany(query, details)
        conn.commit()
        return {'message': 'Upserted the details successfully.'}
    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Failed to upsert details' + str(err))