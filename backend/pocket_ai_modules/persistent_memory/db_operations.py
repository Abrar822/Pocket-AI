from .db import get_conn_obj
from pathlib import Path

def delete_folder_from_memory(foldername: str):
    conn, cur = None, None
    try:
        conn = get_conn_obj()
        cur = conn.cursor()
        query = """
            DELETE FROM memory WHERE LOWER(f_name) = ?
        """
        cur.execute(query, (foldername.lower(),))
        if cur.rowcount > 0:
            conn.commit()
            return 'Folder deleted successfully from Pocket AI Memory.'
        return ''
    except Exception as err:
        return 'Failed to delete a folder in Pocket AI Memory.'
    finally:
        if cur: cur.close()
        if conn: conn.close()

def rename_folder_in_memory(old_foldername: str, new_foldername: str, path: str):
    conn, cur = None, None
    try:
        conn = get_conn_obj()
        cur = conn.cursor()
        query = """
            UPDATE memory SET f_name = ?, location = ? WHERE LOWER(f_name) = ?
        """
        cur.execute(query, (new_foldername.lower(), path, old_foldername.lower()))
        if cur.rowcount > 0:
            conn.commit()
            return 'Folder renamed successfully in Pocket AI Memory.'
        return ''
    except Exception as err:
        print(str(err))
        return 'Failed to rename a folder in Pocket AI Memory.'
    finally:
        if cur: cur.close()
        if conn: conn.close()

def move_folder_in_memory(foldername: str, path: str):
    conn, cur = None, None
    try:
        conn = get_conn_obj()
        cur = conn.cursor()
        query = """
            UPDATE memory SET location = ? WHERE LOWER(f_name) = ?
        """
        cur.execute(query, (path, foldername.lower()))
        if cur.rowcount > 0:
            conn.commit()
            return 'Folder path updated successfully in Pocket AI Memory.'
        return ''
    except Exception as err:
        return 'Failed to update a folder path in Pocket AI Memory.'
    finally:
        if cur: cur.close()
        if conn: conn.close()

def remove_stale_paths():
    conn = get_conn_obj()
    data = []
    query = """
    SELECT * FROM memory
    """
    cursor = conn.cursor()
    cursor.execute(query)
    data = cursor.fetchall()
    data = [{'f_name':d[1], 'location':d[2]} for d in data]
    folder_to_be_removed = []
    
    for obj in data:
        f_name = obj['f_name']
        location = obj['location']
        if not Path(location).is_dir():
            folder_to_be_removed.append((f_name, ))

    query = """
    DELETE FROM memory WHERE f_name = ?
    """
    cursor = conn.cursor()
    cursor.executemany(query, folder_to_be_removed)
    conn.commit()

    cursor.close()
    conn.close()
