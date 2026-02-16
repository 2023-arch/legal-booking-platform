import shutil
import os
import uuid
from fastapi import UploadFile

UPLOAD_DIR = "static/uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def upload_file(file: UploadFile, directory: str) -> str:
    """
    Mock uploader: Saves files locally to static/uploads.
    Returns: Local URL.
    """
    file_extension = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return a local URL (assuming static files are served)
    # We might need to mount static files in main.py
    return f"/static/uploads/{filename}"

def generate_file_url(file_key_or_url: str) -> str:
    return file_key_or_url
