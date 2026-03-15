import cloudinary, cloudinary.uploader, os
from fastapi import UploadFile

cloudinary.config(
  cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key=os.getenv("CLOUDINARY_API_KEY"),
  api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

async def upload_file(file: UploadFile, directory="lawyers") -> str:
    """
    Direct Cloudinary upload implementation as requested.
    """
    try:
        content = await file.read()
        result = cloudinary.uploader.upload(
            content, 
            folder=directory, 
            resource_type="auto"
        )
        await file.seek(0)
        return result["secure_url"]
    except Exception as e:
        print(f"Cloudinary Upload Error: {e}")
        raise e
