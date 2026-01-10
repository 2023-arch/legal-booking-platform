import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
import uuid
from core.config import settings

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY,
    aws_secret_access_key=settings.AWS_SECRET_KEY,
    region_name=settings.AWS_REGION
)

async def upload_file_to_s3(file: UploadFile, directory: str) -> str:
    """
    Uploads a file to S3 and returns the S3 key (path).
    """
    file_extension = file.filename.split('.')[-1]
    filename = f"{directory}/{uuid.uuid4()}.{file_extension}"
    
    try:
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_S3_BUCKET,
            filename,
            ExtraArgs={'ContentType': file.content_type}
        )
    except ClientError as e:
        print(f"Error uploading file to S3: {e}")
        raise e
        
    return filename

def generate_presigned_url(object_name: str, expiration=3600) -> str:
    """
    Generate a presigned URL to share an S3 object
    """
    try:
        response = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': settings.AWS_S3_BUCKET,
                                                            'Key': object_name},
                                                    ExpiresIn=expiration)
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None
    return response
