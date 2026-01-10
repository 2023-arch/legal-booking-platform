from agora_token_builder import RtcTokenBuilder
import time
from core.config import settings

def generate_agora_token(channel_name: str, uid: int | str, role = 1, expiration_in_seconds = 3600) -> str:
    """
    Generate an RTC token for Agora.
    role: 1 = Publisher, 2 = Subscriber
    uid: 0 for generic, or specific int/string user ID
    """
    app_id = settings.AGORA_APP_ID
    app_certificate = settings.AGORA_APP_CERTIFICATE
    
    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expiration_in_seconds
    
    # UID must be int for standard builder if using int_uid, or string for string_uid.
    # We'll assume string user IDs from our UUIDs, but Agora often prefers Int UIDs for simple cases.
    # However, string UUIDs require using buildTokenWithAccount
    
    token = RtcTokenBuilder.buildTokenWithAccount(
        app_id, 
        app_certificate, 
        channel_name, 
        str(uid), 
        role, 
        privilege_expired_ts
    )
    return token
