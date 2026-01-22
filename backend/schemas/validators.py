"""
Input Validators and Sanitizers
================================
OWASP Best Practice: Validate and sanitize all user input.

Features:
- Reusable Pydantic validators
- HTML/XSS sanitization
- Phone number validation (Indian format)
- Password strength validation
- UUID format validation
"""

import re
import html
from typing import Optional
from pydantic import validator, field_validator
import bleach

# =============================================================================
# CONSTANTS - Validation limits following OWASP recommendations
# =============================================================================

# Length limits
MAX_NAME_LENGTH = 100
MAX_EMAIL_LENGTH = 254  # RFC 5321
MAX_PHONE_LENGTH = 15
MAX_PASSWORD_LENGTH = 128
MAX_BIO_LENGTH = 2000
MAX_CASE_DESCRIPTION_LENGTH = 500
MAX_GENERAL_TEXT_LENGTH = 1000

# Minimum lengths
MIN_NAME_LENGTH = 2
MIN_PASSWORD_LENGTH = 8
MIN_CASE_DESCRIPTION_LENGTH = 10

# Regex patterns
PHONE_PATTERN = re.compile(r'^(\+91)?[6-9]\d{9}$')  # Indian phone numbers
UUID_PATTERN = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    re.IGNORECASE
)


# =============================================================================
# SANITIZATION FUNCTIONS
# =============================================================================

def sanitize_html(text: str) -> str:
    """
    Remove all HTML tags and dangerous content.
    OWASP: Prevent XSS attacks by sanitizing user input.
    
    Args:
        text: Raw user input
        
    Returns:
        Sanitized text with HTML removed
    """
    if not text:
        return text
    
    # Use bleach to strip all HTML tags
    clean_text = bleach.clean(
        text,
        tags=[],  # No tags allowed
        attributes={},
        strip=True
    )
    
    # Also escape any remaining HTML entities
    clean_text = html.escape(clean_text, quote=True)
    
    return clean_text


def sanitize_for_display(text: str) -> str:
    """
    Sanitize text for safe display (allows basic formatting).
    
    Args:
        text: Raw user input
        
    Returns:
        Text safe for display
    """
    if not text:
        return text
    
    # Allow only safe tags
    allowed_tags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li']
    
    return bleach.clean(
        text,
        tags=allowed_tags,
        attributes={},
        strip=True
    )


# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

def validate_phone(phone: str) -> str:
    """
    Validate Indian phone number format.
    
    Args:
        phone: Phone number string
        
    Returns:
        Validated phone number
        
    Raises:
        ValueError: If phone format is invalid
    """
    if not phone:
        raise ValueError("Phone number is required")
    
    # Remove spaces and dashes
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    
    if len(cleaned) > MAX_PHONE_LENGTH:
        raise ValueError(f"Phone number too long (max {MAX_PHONE_LENGTH} characters)")
    
    if not PHONE_PATTERN.match(cleaned):
        raise ValueError(
            "Invalid phone format. Use Indian format: +91XXXXXXXXXX or XXXXXXXXXX"
        )
    
    return cleaned


def validate_password_strength(password: str) -> str:
    """
    Validate password meets security requirements.
    OWASP: Enforce strong password policy.
    
    Requirements:
    - 8-128 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    
    Args:
        password: Password string
        
    Returns:
        Validated password
        
    Raises:
        ValueError: If password doesn't meet requirements
    """
    if not password:
        raise ValueError("Password is required")
    
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    
    if len(password) > MAX_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at most {MAX_PASSWORD_LENGTH} characters")
    
    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        raise ValueError("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        raise ValueError("Password must contain at least one digit")
    
    # Check for common weak passwords
    weak_passwords = [
        'password', '12345678', 'qwerty123', 'admin123', 'letmein1'
    ]
    if password.lower() in weak_passwords:
        raise ValueError("Password is too common. Please choose a stronger password")
    
    return password


def validate_uuid_format(uuid_str: str) -> str:
    """
    Validate UUID format.
    
    Args:
        uuid_str: UUID string
        
    Returns:
        Validated UUID string
        
    Raises:
        ValueError: If UUID format is invalid
    """
    if not uuid_str:
        raise ValueError("UUID is required")
    
    if not UUID_PATTERN.match(str(uuid_str)):
        raise ValueError("Invalid UUID format")
    
    return str(uuid_str)


def validate_user_type(user_type: str) -> str:
    """
    Validate user type is one of allowed values.
    
    Args:
        user_type: User type string
        
    Returns:
        Validated user type
        
    Raises:
        ValueError: If user type is invalid
    """
    allowed_types = ['user', 'lawyer', 'admin']
    
    if user_type not in allowed_types:
        raise ValueError(f"User type must be one of: {', '.join(allowed_types)}")
    
    return user_type


def validate_text_length(
    text: str, 
    field_name: str,
    min_length: int = 0,
    max_length: int = MAX_GENERAL_TEXT_LENGTH
) -> str:
    """
    Validate text field length.
    
    Args:
        text: Text to validate
        field_name: Name of field for error messages
        min_length: Minimum required length
        max_length: Maximum allowed length
        
    Returns:
        Validated text
        
    Raises:
        ValueError: If length requirements not met
    """
    if not text and min_length > 0:
        raise ValueError(f"{field_name} is required")
    
    if text and len(text) < min_length:
        raise ValueError(f"{field_name} must be at least {min_length} characters")
    
    if text and len(text) > max_length:
        raise ValueError(f"{field_name} must be at most {max_length} characters")
    
    return text


# =============================================================================
# FILE VALIDATION
# =============================================================================

ALLOWED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
}

MAX_FILE_SIZE_MB = 5


def validate_file_upload(
    file_content_type: str,
    file_size: int,
    filename: str
) -> bool:
    """
    Validate file upload for security.
    
    Args:
        file_content_type: MIME type of file
        file_size: Size in bytes
        filename: Original filename
        
    Returns:
        True if valid
        
    Raises:
        ValueError: If file fails validation
    """
    # Check content type
    if file_content_type not in ALLOWED_FILE_TYPES:
        allowed = ', '.join(ALLOWED_FILE_TYPES.keys())
        raise ValueError(f"File type not allowed. Allowed types: {allowed}")
    
    # Check file size
    max_size_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_size_bytes:
        raise ValueError(f"File too large. Maximum size: {MAX_FILE_SIZE_MB}MB")
    
    # Check extension matches content type
    ext = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    allowed_extensions = ALLOWED_FILE_TYPES.get(file_content_type, [])
    if ext not in allowed_extensions:
        raise ValueError("File extension doesn't match content type")
    
    return True
