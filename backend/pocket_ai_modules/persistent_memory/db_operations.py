from .db import get_conn_obj

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