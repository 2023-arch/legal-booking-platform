import asyncio
import httpx
import json
import os
import uuid
from typing import Dict, Any

# Configurations
BASE_URL = "http://localhost:8000/api/v1"
ADMIN_USERNAME = "legal_platform_admin"
ADMIN_PASSWORD = "SecureAdmin@2026!"
ARTIFACT_DIR = r"C:\Users\rejas\.gemini\antigravity\brain\357523e8-21dc-4687-b01e-96823512d3e4"

# Dummy File Paths
dummy_files = {
    "bar_council_certificate": os.path.join(ARTIFACT_DIR, "dummy_cert.jpg"),
    "id_proof": os.path.join(ARTIFACT_DIR, "dummy_id.jpg"),
    "profile_photo": os.path.join(ARTIFACT_DIR, "dummy_photo.jpg")
}

# Generate random suffix for unique test data
unique_suffix = str(uuid.uuid4())[:8]
LAWYER_EMAIL = f"lawyer.{unique_suffix}@example.com"
USER_EMAIL = f"user.{unique_suffix}@example.com"
PASSWORD = "Test@123456"

# Generate unique phone number (basic)
import random
random_phone = f"9{random.randint(100000000, 999999999)}"

async def main():
    print(f"🚀 Starting E2E API Test with suffix: {unique_suffix}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # ==============================================================================
        # 1. REGISTER LAWYER USER
        # ==============================================================================
        print("\n1. Registering Lawyer User...")
        resp = await client.post(f"{BASE_URL}/auth/register", json={
            "full_name": f"Test Lawyer {unique_suffix}",
            "email": LAWYER_EMAIL,
            "phone": random_phone,
            "password": PASSWORD,
            "user_type": "lawyer"
        })
        if resp.status_code != 200:
            print(f"❌ Failed to register lawyer: {resp.text}")
            return
        lawyer_token = resp.json()
        lawyer_headers = {"Authorization": f"Bearer {lawyer_token['access_token']}"}
        print("✅ Lawyer User Registered")

        # ==============================================================================
        # 2. CREATE LAWYER PROFILE
        # ==============================================================================
        print("\n2. Creating Lawyer Profile...")
        
        # Open files for upload
        files = {}
        file_handles = []
        try:
            for key, path in dummy_files.items():
                if not os.path.exists(path):
                    # Create if missing (fallback)
                    with open(path, "wb") as f:
                        f.write(b"dummy image content")
                
                f = open(path, "rb")
                file_handles.append(f)
                files[key] = (os.path.basename(path), f, "image/jpeg")

            # Form Data
            data = {
                "bar_council_number": f"MAH/{unique_suffix}/2026",
                "years_experience": 5,
                "languages": json.dumps(["English", "Hindi"]),
                "consultation_fee": 1500,
                "court_ids": json.dumps([]), # Sending empty for now
                "specializations": json.dumps([{"specialization_id": "00000000-0000-0000-0000-000000000000"}]), # Assuming backend handles invalid UUIDs gracefully as per code
                "bio": "Expert lawyer for automated testing purposes."
            }
            
            resp = await client.post(f"{BASE_URL}/lawyers/register", data=data, files=files, headers=lawyer_headers)
            
            if resp.status_code != 200:
                print(f"❌ Failed to create lawyer profile: {resp.text}")
                # return # Don't return, maybe it already exists?
            else:
                lawyer_profile = resp.json()
                lawyer_id = lawyer_profile["id"]
                print(f"✅ Lawyer Profile Created (ID: {lawyer_id})")
                
        finally:
            for f in file_handles:
                f.close()

        # ==============================================================================
        # 3. ADMIN VERIFICATION
        # ==============================================================================
        print("\n3. Verifying Lawyer as Admin...")
        
        # Login Admin
        resp = await client.post(f"{BASE_URL}/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        if resp.status_code != 200:
            print(f"❌ Admin Login Failed: {resp.text}")
            return
        admin_token = resp.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get Pending Lawyers to find our ID (if we missed it in creation or need to simulate admin flow)
        resp = await client.get(f"{BASE_URL}/admin/lawyers/pending", headers=admin_headers)
        pending_lawyers = resp.json()
        
        target_lawyer = next((l for l in pending_lawyers if l["email"] == LAWYER_EMAIL), None)
        
        if not target_lawyer:
             # Check if already verified?
             print("⚠️ Lawyer not found in pending list (maybe auto-verified or error?).")
        else:
            lawyer_id = target_lawyer["id"]
            print(f"   Found pending lawyer ID: {lawyer_id}")
            
            # Verify
            resp = await client.post(f"{BASE_URL}/admin/lawyers/{lawyer_id}/verify?action=approve", headers=admin_headers, json={})
            if resp.status_code != 200:
                 print(f"❌ Verification Failed: {resp.text}")
            else:
                 print("✅ Lawyer Verified Successfully")

        # ==============================================================================
        # 4. REGISTER END USER
        # ==============================================================================
        print("\n4. Registering End User...")
        resp = await client.post(f"{BASE_URL}/auth/register", json={
            "full_name": f"Test User {unique_suffix}",
            "email": USER_EMAIL,
            "phone": "9876543210",
            "password": PASSWORD,
            "user_type": "user"
        })
        if resp.status_code != 200:
            print(f"❌ User Registration Failed: {resp.text}")
            return
        user_token = resp.json()
        user_headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        print("✅ End User Registered")

        # ==============================================================================
        # 5. BOOKING FLOW
        # ==============================================================================
        print("\n5. Creating Booking...")
        
        # Need lawyer ID again if not set above
        if 'lawyer_id' not in locals():
            print("❌ Cannot proceed without lawyer_id")
            return

        # Create Draft
        booking_payload = {
            "lawyer_id": lawyer_id,
            "case_description": "I need help with a property dispute case.",
            "preferred_time": "2026-12-01T10:00:00",
            "duration_minutes": 30
        }
        resp = await client.post(f"{BASE_URL}/bookings/create", json=booking_payload, headers=user_headers)
        if resp.status_code != 200:
            print(f"❌ Booking Draft Creation Failed: {resp.text}")
            return
        draft_data = resp.json()
        draft_id = draft_data["booking_draft_id"]
        print(f"✅ Booking Draft Created (ID: {draft_id})")
        
        # Confirm & "Pay"
        resp = await client.post(f"{BASE_URL}/bookings/confirm?booking_draft_id={draft_id}", headers=user_headers, json={})
        if resp.status_code != 200:
             print(f"❌ Booking Confirmation Failed: {resp.text}")
             return
        
        payment_data = resp.json()
        razorpay_order_id = payment_data["razorpay_order_id"]
        print(f"✅ Booking Confirmed. Order ID: {razorpay_order_id}")
        
        # ==============================================================================
        # 6. VERIFY PAYMENT (Simulated)
        # ==============================================================================
        print("\n6. Verifying Payment...")
        # Since backend is in TEST_MODE (likely), it accepts any signature for order_TEST_
        payment_verify_payload = {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": f"pay_{unique_suffix}",
            "razorpay_signature": "dummy_signature"
        }
        
        resp = await client.post(f"{BASE_URL}/payments/verify", json=payment_verify_payload, headers=user_headers)
        if resp.status_code != 200:
            print(f"❌ Payment Verification Failed: {resp.text}")
            return
            
        final_booking_data = resp.json()
        booking_id = final_booking_data["booking_id"]
        print(f"✅ Payment Verified. Booking ID: {booking_id}")

        # ==============================================================================
        # 7. LAWYER ACCEPT BOOKING
        # ==============================================================================
        print("\n7. Lawyer Accepting Booking...")
        
        # Switch to Lawyer Context
        # We need to accept the booking. 
        # Check if booking status is 'pending'
        
        # Lawyer fetches booking details
        resp = await client.get(f"{BASE_URL}/bookings/{booking_id}", headers=lawyer_headers)
        if resp.status_code != 200:
             print(f"❌ Lawyer fetch booking failed: {resp.text}")
             return
        
        booking_details = resp.json()
        print(f"   Current Status: {booking_details['status']}")
        
        # Accept
        resp = await client.patch(f"{BASE_URL}/bookings/{booking_id}/status?status_in=accepted", headers=lawyer_headers, json={})
        if resp.status_code != 200:
            print(f"❌ Lawyer Accept Failed: {resp.text}")
            return
            
        updated_booking = resp.json()
        print(f"✅ Booking Status Updated to: {updated_booking['status']}")
        
        if updated_booking['status'] == 'accepted':
            print("\n🎉 SUCCESS: Full E2E Flow Completed!")
        else:
            print("\n⚠️ Flow completed but status is not accepted.")

    print("\n--------------------------------------------------")

if __name__ == "__main__":
    asyncio.run(main())
