import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from core.config import settings
    print("SUCCESS: Settings loaded successfully")
    print(f"Project: {settings.PROJECT_NAME}")
    print(f"Origins: {settings.BACKEND_CORS_ORIGINS}")
except Exception as e:
    print(f"ERROR: Error loading settings: {e}")
    import traceback
    traceback.print_exc()
