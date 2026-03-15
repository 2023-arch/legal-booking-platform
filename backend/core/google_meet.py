from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import timedelta
import uuid, json, os

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def create_meet_link(lawyer_email, user_email, start_time,
                     duration_minutes=60, title="LegalBook Consultation"):
    creds_info = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not creds_info:
        # Graceful degradation for dev if env missing
        print("Warning: GOOGLE_SERVICE_ACCOUNT_JSON is missing! Returning dummy meet link.")
        return f"https://meet.google.com/test-{str(uuid.uuid4())[:10]}"
        
    creds = service_account.Credentials.from_service_account_info(
        json.loads(creds_info),
        scopes=SCOPES)
    service = build("calendar", "v3", credentials=creds)
    event = {
        "summary": title,
        "start": {"dateTime": start_time.isoformat(),
                  "timeZone": "Asia/Kolkata"},
        "end":   {"dateTime":
                  (start_time+timedelta(minutes=duration_minutes)).isoformat(),
                  "timeZone": "Asia/Kolkata"},
        "attendees": [{"email":lawyer_email},{"email":user_email}],
        "conferenceData": {"createRequest": {
            "requestId": str(uuid.uuid4()),
            "conferenceSolutionKey":{"type":"hangoutsMeet"}}}
    }
    result = service.events().insert(
        calendarId="primary", body=event,
        conferenceDataVersion=1, sendUpdates="all").execute()
    return result["conferenceData"]["entryPoints"][0]["uri"]
