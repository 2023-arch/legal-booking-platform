import requests
import sys

BACKEND_URL = "https://legal-booking-platform.onrender.com"
FRONTEND_URL = "https://legal-booking-platform.vercel.app"

def check_url(url, parsed_msg):
    try:
        response = requests.get(url, timeout=10)
        print(f"Checking {parsed_msg} ({url})... Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error checking {parsed_msg}: {e}")
        return False

def check_cors():
    try:
        url = f"{BACKEND_URL}/api/v1/health" # Or any endpoint
        headers = {
            "Origin": FRONTEND_URL,
            "Access-Control-Request-Method": "GET"
        }
        response = requests.options(url, headers=headers, timeout=10)
        print(f"Checking CORS OPTIONS on {url}...")
        print(f"Status: {response.status_code}")
        print("Access-Control-Allow-Origin:", response.headers.get("access-control-allow-origin"))
        print("Access-Control-Allow-Methods:", response.headers.get("access-control-allow-methods"))
        
        if response.headers.get("access-control-allow-origin") == FRONTEND_URL:
            print("✅ CORS Origin matches frontend.")
            return True
        else:
            print("❌ CORS Origin Mismatch or missing header.")
            return False
    except Exception as e:
        print(f"Error checking CORS: {e}")
        return False

def main():
    print("--- Starting Production Verification ---")
    
    # 1. Backend Health
    # Backend might not have a root route, check /docs or /api/v1/health if exists, or just /
    # Based on main.py view earlier: there is no root route defined explicitly in the snippets seen, 
    # but FastAPI provides /docs by default. 
    # Let's check /health (standard) and /docs
    
    backend_health = check_url(f"{BACKEND_URL}/health", "Backend Health")
    backend_docs = check_url(f"{BACKEND_URL}/docs", "Backend Docs")
    
    # 2. Frontend Health
    frontend_health = check_url(FRONTEND_URL, "Frontend Health")
    
    # 3. CORS
    cors_ok = check_cors()
    
    if (backend_health or backend_docs) and frontend_health:
        print("\n✅ Connectivity Check Passed.")
    else:
        print("\n❌ Connectivity Check Failed.")

if __name__ == "__main__":
    main()
