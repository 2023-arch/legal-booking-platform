import requests
import json
import uuid
import random

BASE_URL = "http://localhost:8000/api/v1"

def print_response(response):
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def test_api():
    print("="*50)
    print("🚀 STARTING API TEST")
    print("="*50)

    # 1. Register User
    print("\n[1] Registering new user...")
    random_id = str(uuid.uuid4())[:8]
    email = f"test_user_{random_id}@example.com"
    password = "Test@123456"
    
    # Generate random 10 digit number
    random_phone_digits = f"98{random.randint(10000000, 99999999)}"
    phone = f"+91{random_phone_digits}"

    payload = {
        "email": email,
        "password": password,
        "full_name": "Test User API",
        "phone": phone,
        "user_type": "user"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print_response(response)
            return
        
        print(f"Response Text: {response.text}")
        data = response.json()
        print("✅ Registration Successful")
        access_token = data.get("access_token")
        print(f"Token: {access_token[:20]}...")
        
    except Exception as e:
        print(f"❌ Registration Failed: {e}")
        return

    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Get Current User
    print("\n[2] Fetching Current User Profile...")
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)
    print(f"Status: {response.status_code}")
    print_response(response)
    user_id = response.json().get("id")

    # 3. Search Lawyers
    print("\n[3] Searching Lawyers...")
    response = requests.get(f"{BASE_URL}/lawyers/search", headers=headers)
    print(f"Status: {response.status_code}")
    lawyers = response.json()
    print(f"Found {len(lawyers)} lawyers")
    
    lawyer_id = None
    if len(lawyers) > 0:
        lawyer = lawyers[0]
        lawyer_id = lawyer.get("id") # Depending on structure
        print(f"Selected Lawyer: {lawyer.get('full_name')} (ID: {lawyer_id})")

    # 4. Create Booking (if lawyer found)
    if lawyer_id:
        print("\n[4] Creating Booking...")
        booking_payload = {
            "lawyer_id": lawyer_id,
            "appointment_time": "2026-12-31T10:00:00", # Future date
            "description": "API Test Booking Case",
            "consultation_type": "video" # If required
        }
        # Note: Need to check exact schema for booking
        # Checking backend/schemas/booking.py usually
        # Assuming simple schema for now, will adjust if fails
        
        response = requests.post(f"{BASE_URL}/bookings/", json=booking_payload, headers=headers)
        print(f"Status: {response.status_code}")
        print_response(response)

if __name__ == "__main__":
    test_api()
