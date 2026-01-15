import boto3
import cloudinary
import cloudinary.uploader
from botocore.exceptions import ClientError
from fastapi import UploadFile
import uuid
from core.config import settings

# Initialize S3 Client (only if needed/configured)
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY,
    aws_secret_access_key=settings.AWS_SECRET_KEY,
    region_name=settings.AWS_REGION
)

# Initialize Cloudinary (Always available if configured)
if settings.USE_CLOUDINARY:
    cloudinary.config( 
      cloud_name = settings.CLOUDINARY_CLOUD_NAME, 
      api_key = settings.CLOUDINARY_API_KEY, 
      api_secret = settings.CLOUDINARY_API_SECRET 
    )

async def upload_file(file: UploadFile, directory: str) -> str:
    """
    Universal uploader: Defaults to Cloudinary if enabled, falls back to S3.
    Returns: PUBLIC URL of the uploaded file.
    """
    if settings.USE_CLOUDINARY:
        try:
            # Cloudinary handles file resizing/optimizing automatically if needed
            result = cloudinary.uploader.upload(
                file.file, 
                folder=f"legal_booking/{directory}",
                resource_type="auto"
            )
            return result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary Upload Error: {e}")
            raise e
            
    # Fallback to AWS S3 logic
    else:
        file_extension = file.filename.split('.')[-1]
        filename = f"{directory}/{uuid.uuid4()}.{file_extension}"
        
        try:
            s3_client.upload_fileobj(
                file.file,
                settings.AWS_S3_BUCKET,
                filename,
                ExtraArgs={'ContentType': file.content_type}
            )
            
            # If using S3, we typically return the key to generate presigned URLs later,
            # BUT for consistency with Cloudinary which returns public URLs, 
            # we might want to change this strategy. 
            # For now, let's stick to the existing S3 pattern (Key) 
            # and handle URL generation downstream if S3 is active.
            return filename
            
        except ClientError as e:
            print(f"Error uploading file to S3: {e}")
            raise e

def generate_file_url(file_key_or_url: str) -> str:
    """
    Universal URL generator. 
    If it looks like a URL (Cloudinary), return it.
    If it looks like a key (S3), generate presigned URL.
    """
    if not file_key_or_url:
        return ""
        
    if file_key_or_url.startswith("http"):
        return file_key_or_url
        
    # S3 Logic
    try:
        response = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': settings.AWS_S3_BUCKET,
                                                            'Key': file_key_or_url},
                                                    ExpiresIn=3600)
        return response
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return ""
