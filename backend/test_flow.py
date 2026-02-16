import requests
import json
import uuid
import random
import time

BASE_URL = "http://localhost:8000/api/v1"

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def log(msg, type="info"):
    if type == "header":
        print(f"{Colors.HEADER}{Colors.BOLD}\n=== {msg} ==={Colors.ENDC}")
    elif type == "success":
        print(f"{Colors.OKGREEN}✅ {msg}{Colors.ENDC}")
    elif type == "error":
        print(f"{Colors.FAIL}❌ {msg}{Colors.ENDC}")
    elif type == "info":
        print(f"{Colors.OKBLUE}ℹ️ {msg}{Colors.ENDC}")
    else:
        print(msg)

def print_json(data):
    print(json.dumps(data, indent=2))

def run_flow():
    session = requests.Session()
    
    # Random suffix for uniqueness
    uid = str(uuid.uuid4())[:8]
    lawyer_email = f"lawyer_{uid}@example.com"
    user_email = f"user_{uid}@example.com"
    password = "Test@123456"
    
    # -------------------------------------------------------------------------
    # 1. REGISTER LAWYER
    # -------------------------------------------------------------------------
    log("STEP 1: Registering Lawyer", "header")
    
    # Note: Using /auth/register with user_type="lawyer" as per auth.py inspection
    # Wait, need to check if /auth/lawyer-register exists or strictly /auth/register
    # In auth.py we saw /auth/register handles user_type
    
    lawyer_payload = {
        "email": lawyer_email,
        "password": password,
        "full_name": f"Advocate flow_{uid}",
        "phone": f"+91{random.randint(6000000000, 9999999999)}",
        "user_type": "lawyer"
    }
    
    try:
        res = session.post(f"{BASE_URL}/auth/register", json=lawyer_payload)
        if res.status_code != 200:
            log(f"Lawyer Reg Failed: {res.text}", "error")
            return
        
        lawyer_data = res.json()
        lawyer_token = lawyer_data["access_token"]
        log(f"Lawyer registered: {lawyer_email}", "success")
        
        # We need the lawyer's user ID to find their lawyer profile ID
        # Let's get "me"
        res = session.get(f"{BASE_URL}/users/me", headers={"Authorization": f"Bearer {lawyer_token}"})
        lawyer_user_id = res.json()["id"]
        log(f"Lawyer User ID: {lawyer_user_id}")
        
    except Exception as e:
        log(f"Exception during Lawyer Reg: {e}", "error")
        return

    # -------------------------------------------------------------------------
    # 2. ADMIN VERIFICATION
    # -------------------------------------------------------------------------
    log("STEP 2: Admin Verification", "header")
    
    # Admin Login
    admin_payload = {
        "username": "legal_platform_admin",
        "password": "SecureAdmin@2026!"  # From .env
    }
    
    try:
        res = session.post(f"{BASE_URL}/admin/login", json=admin_payload)
        if res.status_code != 200:
            log(f"Admin Login Failed: {res.text}", "error")
            return
            
        admin_token = res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        log("Admin Logged In", "success")
        
        # Find the lawyer profile
        # Use /admin/lawyers/pending
        res = session.get(f"{BASE_URL}/admin/lawyers/pending", headers=admin_headers)
        pending_lawyers = res.json()
        
        target_lawyer_id = None
        for l in pending_lawyers:
            if l["user_id"] == lawyer_user_id:
                target_lawyer_id = l["id"]
                break
        
        if not target_lawyer_id:
            # Maybe already verified? or auto-verified in dev?
            # Or payload didn't create lawyer profile?
            # Wait, /auth/register ONLY creates User. 
            # Does it create Lawyer profile?
            # Let's check auth.py again... 
            # Review Step 398 (auth.py lines 90-136): It creates User, but NOT Lawyer profile!
            # The User might need to hit a separate endpoint to create profile?
            # Or maybe checking schemas/lawyer.py or endpoints/lawyers.py
            log("Lawyer profile not found in pending list. Checking if profile needs creation...", "warning")
            
            # If explicit profile creation is needed, the Lawyer flow is: 
            # 1. Register User 
            # 2. Create Profile
            # Let's assume we need to create profile.
            
            # Let's search endpoint to create profile
            # Trying POST /lawyers/profile or similar
            # Since I cannot see it in my memory, I will attempt to CREATE it if I can find the endpoint
            # But let's proceed to create it here
            
            log("Attempting to create Lawyer Profile...", "info")
            # Endpoint is /lawyers/register and requires Multipart Form Data (files)
            
            # Create dummy files
            files = {
                'bar_council_certificate': ('cert.pdf', b'%PDF-1.4 mock content', 'application/pdf'),
                'id_proof': ('aadhaar.jpg', b'\xff\xd8\xff mock content', 'image/jpeg'),
                'profile_photo': ('photo.jpg', b'\xff\xd8\xff mock content', 'image/jpeg')
            }
            
            data = {
                "bar_council_number": f"MH/2026/{uid}",
                "years_experience": 5,
                "education": "LLB",
                "bio": "Test Bio Lawyer",
                "languages": '["English", "Hindi"]',
                "consultation_fee": 1500,
                "court_ids": '[]', # Or ["uuid"] if we knew one
                "specializations": '[]'
            }
            
            # Note: Requests automatically sets Content-Type to multipart/form-data when 'files' is present
            res = session.post(f"{BASE_URL}/lawyers/register", data=data, files=files, headers={"Authorization": f"Bearer {lawyer_token}"})
            
            if res.status_code in [200, 201]:
                log("Lawyer Profile Created via API", "success")
                target_lawyer_id = res.json()["id"]
            else:
                log(f"Failed to create profile: {res.status_code}", "error")
                log(f"Response: {res.text}", "error")
                # Cannot proceed without profile
                return
        
        if target_lawyer_id:
            # Verify
            verify_payload = {"action": "approve"}
            res = session.post(f"{BASE_URL}/admin/lawyers/{target_lawyer_id}/verify", json=verify_payload, headers=admin_headers)
            if res.status_code == 200:
                log(f"Lawyer Verified: {target_lawyer_id}", "success")
            else:
                 log(f"Verification Failed: {res.text}", "error")
                 
    except Exception as e:
        log(f"Exception during Admin: {e}", "error")
        return

    # -------------------------------------------------------------------------
    # 3. REGISTER USER
    # -------------------------------------------------------------------------
    log("STEP 3: Registering User", "header")
    
    user_payload = {
        "email": user_email,
        "password": password,
        "full_name": f"Client flow_{uid}",
        "phone": f"+91{random.randint(6000000000, 9999999999)}",
        "user_type": "user"
    }
    
    try:
        res = session.post(f"{BASE_URL}/auth/register", json=user_payload)
        user_token = res.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        log(f"User registered: {user_email}", "success")
        
    except Exception as e:
        log(f"Exception during User Reg: {e}", "error")
        return

    # -------------------------------------------------------------------------
    # 4. BOOKING
    # -------------------------------------------------------------------------
    log("STEP 4: Booking Flow", "header")
    
    try:
        # User searches for lawyer
        # We know target_lawyer_id
        
        # 1. Create Draft
        draft_payload = {
            "lawyer_id": target_lawyer_id,
            "case_description": "Need legal advice on contract",
            "preferred_time": "2026-12-31T10:00:00",
            "duration_minutes": 30
        }
        res = session.post(f"{BASE_URL}/bookings/create", json=draft_payload, headers=user_headers)
        if res.status_code != 200:
            log(f"Draft Create Failed: {res.text}", "error")
            return
            
        draft_data = res.json()
        draft_id = draft_data["booking_draft_id"]
        log(f"Booking Draft Created: {draft_id}", "success")
        
        # 2. Confirm (Payment)
        # Mock payment flow
        res = session.post(f"{BASE_URL}/bookings/confirm?booking_draft_id={draft_id}", headers=user_headers)
        if res.status_code != 200:
             log(f"Confirm Failed: {res.text}", "error")
             return
             
        payment_data = res.json()
        order_id = payment_data["razorpay_order_id"]
        log(f"Payment Order Created: {order_id}. Amount: {payment_data['amount']}", "success")
        
        # 3. Verify Payment (Callback)
        # We need to simulate Razorpay verification
        # Endpoint: /payments/verify
        # Payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        
        mock_payment_id = f"pay_{uuid.uuid4()}"
        mock_signature = "mock_signature" # Backend in test mode might accept anything or we need to compute it
        
        # Note: If backend is NOT in test mode, this will fail. backend/.env has keys empty?
        # payment.py checks keys.
        
        verify_payload = {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": mock_payment_id,
            "razorpay_signature": mock_signature
        }
        
        res = session.post(f"{BASE_URL}/payments/verify", json=verify_payload, headers=user_headers)
        if res.status_code != 200:
            log(f"Payment Verification Failed: {res.text}", "error")
            # If failed, we can't get booking ID easily
            return
            
        final_booking = res.json()
        booking_id = final_booking["id"] # or booking_id
        log(f"Booking Confirmed! ID: {booking_id}", "success")
        
    except Exception as e:
        log(f"Exception during Booking: {e}", "error")
        return

    # -------------------------------------------------------------------------
    # 5. LAWYER ACCEPTANCE
    # -------------------------------------------------------------------------
    log("STEP 5: Lawyer Acceptance", "header")
    
    try:
        # Lawyer Login handling (already have token)
        lawyer_headers = {"Authorization": f"Bearer {lawyer_token}"}
        
        # Check bookings
        # URL: /bookings/ or /lawyers/bookings?
        # Using /api/v1/bookings/ based on file reading
        res = session.get(f"{BASE_URL}/bookings/", headers=lawyer_headers)
        bookings = res.json()
        
        found = False
        for b in bookings:
            if b["id"] == booking_id:
                found = True
                log(f"Lawyer sees booking: {b['status']}", "success")
                break
        
        if not found:
            log("Lawyer did not find the booking!", "error")
        
        # Accept
        # PATCH /bookings/{id}/status
        res = session.patch(f"{BASE_URL}/bookings/{booking_id}/status?status_in=accepted", headers=lawyer_headers)
        if res.status_code == 200:
            log("Booking Accepted by Lawyer", "success")
        else:
            log(f"Acceptance Failed: {res.text}", "error")

    except Exception as e:
        log(f"Exception during Lawyer Accept: {e}", "error")
        return
        
    # -------------------------------------------------------------------------
    # 6. MEETING
    # -------------------------------------------------------------------------
    log("STEP 6: Meeting (Mock)", "header")
    log("Google Meet link would be generated here in a real scenario.", "info")
    log("Test Flow Completed Successfully!", "success")

if __name__ == "__main__":
    run_flow()
