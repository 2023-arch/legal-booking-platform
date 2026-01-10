# LEGAL BOOKING SAAS PLATFORM - COMPLETE DEVELOPMENT PROMPT

## PROJECT OVERVIEW

You are tasked with building a comprehensive legal booking SaaS platform for the Indian market. This platform connects users who need legal services with verified lawyers, incorporating AI-powered case summaries, secure payments, video consultations, and a RAG-based legal assistant.

**Core Value Proposition:**
- Background-verified lawyers only (manual admin verification)
- AI-powered case summaries from user descriptions
- All-India coverage with court/police station filtering
- Secure escrow payment system (10% platform commission)
- In-app consultations (chat, voice, video)
- RAG-based AI legal assistant for both users and lawyers

**Tech Stack Requirements:**
- **Frontend:** React.js with Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Python with FastAPI, async/await patterns
- **Database:** PostgreSQL 15+ (primary), Redis 7+ (caching/sessions)
- **Vector DB:** Pinecone (for RAG system)
- **Authentication:** JWT tokens with refresh mechanism
- **Payment:** Razorpay (India-focused)
- **Video/Voice:** Agora RTC
- **AI:** Google Gemini API (for case summaries and RAG)
- **Embeddings:** sentence-transformers (open-source, local)
- **Storage:** AWS S3 (encrypted document storage)
- **Hosting:** AWS (Mumbai region for data residency)
- **Monitoring:** Sentry (errors), basic logging

---

## DETAILED REQUIREMENTS

### 1. USER MANAGEMENT & AUTHENTICATION

#### 1.1 User Registration
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "string (required, 3-100 chars)",
  "email": "string (required, valid email)",
  "phone": "string (required, Indian format: +91XXXXXXXXXX)",
  "password": "string (required, min 8 chars, 1 uppercase, 1 number, 1 special)",
  "user_type": "user | lawyer"
}
```

**Implementation Requirements:**
- Validate email format and uniqueness
- Validate Indian phone number format (+91XXXXXXXXXX)
- Hash password using bcrypt (cost factor: 12)
- Send OTP to both email and phone for verification
- OTP: 6-digit numeric, valid for 10 minutes
- Store user as "pending_verification" status
- Return JWT token (expires in 15 min) + refresh token (expires in 7 days)

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "access_token": "jwt_string",
    "refresh_token": "jwt_string",
    "requires_verification": true
  }
}
```

#### 1.2 OTP Verification
**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "user_id": "uuid",
  "email_otp": "string (6 digits)",
  "phone_otp": "string (6 digits)"
}
```

**Implementation:**
- Verify both OTPs match stored values
- Check OTP expiry (10 minutes)
- Update user status to "active"
- Return success message

#### 1.3 Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email_or_phone": "string",
  "password": "string"
}
```

**Implementation:**
- Support login with either email or phone
- Verify password using bcrypt
- Check if user is verified (status: "active")
- Generate new JWT tokens
- Store session in Redis (key: `session:{user_id}`, TTL: 7 days)
- Return tokens and user profile

#### 1.4 Token Refresh
**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Implementation:**
- Verify refresh token signature
- Check if token is blacklisted (Redis: `blacklist:{token}`)
- Check if session exists in Redis
- Generate new access token (15 min expiry)
- Return new access token

#### 1.5 Logout
**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer {access_token}`

**Implementation:**
- Extract user_id from JWT
- Delete session from Redis
- Add tokens to blacklist (Redis, TTL: 7 days)
- Return success

---

### 2. LAWYER REGISTRATION & VERIFICATION

#### 2.1 Lawyer Registration
**Endpoint:** `POST /api/lawyers/register`

**Request Body (multipart/form-data):**
```json
{
  "user_id": "uuid (from initial registration)",
  "bar_council_number": "string (required)",
  "years_experience": "integer (required, 0-50)",
  "education": "string (optional, max 500 chars)",
  "bio": "string (optional, max 1000 chars)",
  "languages": ["english", "hindi", "bengali"],
  "consultation_fee": "integer (required, min 500, max 100000)",
  "courts": ["court_id_1", "court_id_2"],
  "specializations": [
    {
      "specialization_id": "uuid",
      "sub_specialization_id": "uuid"
    }
  ],
  "bar_council_certificate": "file (PDF/JPG/PNG, max 5MB)",
  "id_proof": "file (PDF/JPG/PNG, max 5MB)",
  "profile_photo": "file (JPG/PNG, max 2MB, optional)"
}
```

**Implementation:**
- Validate all required fields
- Validate Bar Council number format (alphanumeric, 5-20 chars)
- Upload files to S3 with encryption:
  - Path: `lawyers/{user_id}/documents/{filename}`
  - Generate signed URLs (expires in 1 hour) for admin review
- Store lawyer data in database with status: "pending_verification"
- Create audit log entry
- Send email notification to admin team
- Return success message

**Database Schema for Lawyers Table:**
```sql
CREATE TABLE lawyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    bar_council_number VARCHAR(50) UNIQUE NOT NULL,
    years_experience INTEGER NOT NULL CHECK (years_experience >= 0 AND years_experience <= 50),
    education TEXT,
    bio TEXT,
    languages TEXT[] NOT NULL,
    consultation_fee INTEGER NOT NULL CHECK (consultation_fee >= 500 AND consultation_fee <= 100000),
    verification_status VARCHAR(20) DEFAULT 'pending_verification' CHECK (verification_status IN ('pending_verification', 'verified', 'rejected')),
    rejection_reason TEXT,
    bar_council_certificate_url TEXT NOT NULL,
    id_proof_url TEXT NOT NULL,
    profile_photo_url TEXT,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lawyer_courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id UUID REFERENCES lawyers(id) ON DELETE CASCADE,
    court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lawyer_id, court_id)
);

CREATE TABLE lawyer_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id UUID REFERENCES lawyers(id) ON DELETE CASCADE,
    specialization_id UUID REFERENCES specializations(id) ON DELETE CASCADE,
    sub_specialization_id UUID REFERENCES specializations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lawyer_id, specialization_id, sub_specialization_id)
);

CREATE INDEX idx_lawyers_verification_status ON lawyers(verification_status);
CREATE INDEX idx_lawyers_user_id ON lawyers(user_id);
CREATE INDEX idx_lawyer_courts_lawyer_id ON lawyer_courts(lawyer_id);
CREATE INDEX idx_lawyer_courts_court_id ON lawyer_courts(court_id);
CREATE INDEX idx_lawyer_specializations_lawyer_id ON lawyer_specializations(lawyer_id);
```

#### 2.2 Admin: Get Pending Verifications
**Endpoint:** `GET /api/admin/lawyers/pending`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `page`: integer (default: 1)
- `limit`: integer (default: 20, max: 100)

**Implementation:**
- Verify admin role from JWT
- Query lawyers with status "pending_verification"
- Include document signed URLs (generate on-the-fly, 1-hour expiry)
- Order by created_at DESC
- Return paginated results

**Response:**
```json
{
  "success": true,
  "data": {
    "lawyers": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "string",
        "email": "string",
        "phone": "string",
        "bar_council_number": "string",
        "years_experience": 5,
        "education": "string",
        "bio": "string",
        "consultation_fee": 3000,
        "bar_council_certificate_url": "signed_s3_url",
        "id_proof_url": "signed_s3_url",
        "profile_photo_url": "signed_s3_url",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

#### 2.3 Admin: Verify/Reject Lawyer
**Endpoint:** `POST /api/admin/lawyers/{lawyer_id}/verify`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "action": "approve | reject",
  "rejection_reason": "string (required if action=reject)"
}
```

**Implementation:**
- Verify admin role
- Update lawyer verification_status
- If approved:
  - Set status to "verified"
  - Set verified_at timestamp
  - Set verified_by to admin user_id
  - Send congratulatory email to lawyer
- If rejected:
  - Set status to "rejected"
  - Set rejection_reason
  - Send rejection email with reason
- Create audit log entry
- Return success

---

### 3. COURTS, POLICE STATIONS & SPECIALIZATIONS

#### 3.1 Database Schema

```sql
CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state_id, name)
);

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('supreme_court', 'high_court', 'district_court', 'sessions_court', 'magistrate_court', 'family_court', 'tribunal')),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE police_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES specializations(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_districts_state_id ON districts(state_id);
CREATE INDEX idx_courts_district_id ON courts(district_id);
CREATE INDEX idx_courts_type ON courts(type);
CREATE INDEX idx_police_stations_district_id ON police_stations(district_id);
CREATE INDEX idx_specializations_parent_id ON specializations(parent_id);
```

**Seed Specializations:**
```sql
-- Main categories
INSERT INTO specializations (name, parent_id, description) VALUES
('Criminal Law', NULL, 'Cases involving crimes and offenses'),
('Civil Law', NULL, 'Cases involving disputes between individuals or organizations'),
('Family Law', NULL, 'Cases involving family matters'),
('Corporate Law', NULL, 'Cases involving business and corporate matters'),
('Environmental Law', NULL, 'Cases involving environmental protection'),
('Tax Law', NULL, 'Cases involving taxation'),
('Labor Law', NULL, 'Cases involving employment and workplace'),
('Intellectual Property Law', NULL, 'Cases involving patents, trademarks, copyrights');

-- Criminal Law sub-specializations
INSERT INTO specializations (name, parent_id, description) VALUES
('White Collar Crime', (SELECT id FROM specializations WHERE name='Criminal Law'), 'Financial frauds, embezzlement, bribery'),
('Domestic Violence', (SELECT id FROM specializations WHERE name='Criminal Law'), 'Violence within household'),
('Murder/Assault', (SELECT id FROM specializations WHERE name='Criminal Law'), 'Violent crimes'),
('Cyber Crime', (SELECT id FROM specializations WHERE name='Criminal Law'), 'Internet and computer-related crimes'),
('Theft/Property Crime', (SELECT id FROM specializations WHERE name='Criminal Law'), 'Theft, burglary, robbery'),
('Drug Offenses', (SELECT id FROM specializations WHERE name='Criminal Law'), 'Drug-related crimes');

-- Civil Law sub-specializations
INSERT INTO specializations (name, parent_id, description) VALUES
('Property Disputes', (SELECT id FROM specializations WHERE name='Civil Law'), 'Land and property conflicts'),
('Contract Disputes', (SELECT id FROM specializations WHERE name='Civil Law'), 'Breach of contract cases'),
('Consumer Disputes', (SELECT id FROM specializations WHERE name='Civil Law'), 'Consumer protection matters'),
('Tort/Negligence', (SELECT id FROM specializations WHERE name='Civil Law'), 'Personal injury, negligence');

-- Family Law sub-specializations
INSERT INTO specializations (name, parent_id, description) VALUES
('Divorce', (SELECT id FROM specializations WHERE name='Family Law'), 'Dissolution of marriage'),
('Child Custody', (SELECT id FROM specializations WHERE name='Family Law'), 'Custody and guardianship'),
('Maintenance/Alimony', (SELECT id FROM specializations WHERE name='Family Law'), 'Financial support matters'),
('Adoption', (SELECT id FROM specializations WHERE name='Family Law'), 'Legal adoption procedures');

-- Corporate Law sub-specializations
INSERT INTO specializations (name, parent_id, description) VALUES
('Company Formation', (SELECT id FROM specializations WHERE name='Corporate Law'), 'Business registration and setup'),
('Mergers & Acquisitions', (SELECT id FROM specializations WHERE name='Corporate Law'), 'Company mergers and acquisitions'),
('Compliance', (SELECT id FROM specializations WHERE name='Corporate Law'), 'Regulatory compliance'),
('Contracts', (SELECT id FROM specializations WHERE name='Corporate Law'), 'Business contracts and agreements');
```

#### 3.2 API Endpoints for Location Data

**Get States:**
```
GET /api/locations/states
Response: { "success": true, "data": [{"id": "uuid", "name": "string", "code": "string"}] }
```

**Get Districts by State:**
```
GET /api/locations/states/{state_id}/districts
Response: { "success": true, "data": [{"id": "uuid", "name": "string"}] }
```

**Get Courts by District:**
```
GET /api/locations/districts/{district_id}/courts
Query: ?type=district_court (optional filter)
Response: { "success": true, "data": [{"id": "uuid", "name": "string", "type": "string", "address": "string"}] }
```

**Get Police Stations by District:**
```
GET /api/locations/districts/{district_id}/police-stations
Response: { "success": true, "data": [{"id": "uuid", "name": "string", "address": "string"}] }
```

**Get Specializations:**
```
GET /api/specializations
Response: {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Criminal Law",
      "sub_specializations": [
        {"id": "uuid", "name": "White Collar Crime"},
        {"id": "uuid", "name": "Cyber Crime"}
      ]
    }
  ]
}
```

**Implementation Notes:**
- Cache all location/specialization data in Redis (TTL: 24 hours)
- Cache key format: `locations:states`, `locations:districts:{state_id}`, etc.
- Invalidate cache when admin updates data

---

### 4. LAWYER SEARCH & DISCOVERY

#### 4.1 Search Lawyers
**Endpoint:** `GET /api/lawyers/search`

**Query Parameters:**
```
state_id: uuid (optional)
district_id: uuid (optional)
court_id: uuid (optional)
police_station_id: uuid (optional)
specialization_id: uuid (optional)
sub_specialization_id: uuid (optional)
min_price: integer (optional)
max_price: integer (optional)
min_experience: integer (optional)
max_experience: integer (optional)
min_rating: float (optional, 0-5)
languages: comma-separated (optional, e.g., "english,hindi")
availability: "today|this_week|this_month" (optional)
sort_by: "price_asc|price_desc|rating_desc|experience_desc" (default: rating_desc)
page: integer (default: 1)
limit: integer (default: 20, max: 100)
```

**Implementation:**
- Build dynamic SQL query with filters
- Join with lawyer_courts, lawyer_specializations tables
- Calculate average rating from reviews table
- Filter only verified lawyers (verification_status = 'verified')
- Apply sorting
- Return paginated results with lawyer profiles

**Response:**
```json
{
  "success": true,
  "data": {
    "lawyers": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "string",
        "profile_photo_url": "string",
        "bio": "string",
        "years_experience": 5,
        "consultation_fee": 3000,
        "languages": ["english", "hindi"],
        "average_rating": 4.5,
        "total_reviews": 120,
        "total_consultations": 150,
        "specializations": [
          {
            "name": "Criminal Law",
            "sub_name": "Cyber Crime"
          }
        ],
        "courts": [
          {
            "name": "Kolkata District Court",
            "type": "district_court"
          }
        ]
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

**Optimization:**
- Use PostgreSQL full-text search for name/bio search
- Create materialized view for lawyer stats (ratings, consultations)
- Refresh materialized view daily or on-demand
- Cache popular search results in Redis (TTL: 1 hour)

#### 4.2 Get Lawyer Profile
**Endpoint:** `GET /api/lawyers/{lawyer_id}`

**Implementation:**
- Fetch lawyer details with all relations
- Include statistics (ratings, total consultations)
- Include recent reviews (last 10)
- Generate signed URL for profile photo (if exists)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "profile_photo_url": "signed_url",
    "bio": "string",
    "education": "string",
    "bar_council_number": "string (masked: ABC***123)",
    "years_experience": 5,
    "consultation_fee": 3000,
    "languages": ["english", "hindi"],
    "average_rating": 4.5,
    "total_reviews": 120,
    "total_consultations": 150,
    "specializations": [...],
    "courts": [...],
    "recent_reviews": [
      {
        "id": "uuid",
        "user_name": "string (anonymized: J***n D***)",
        "rating": 5,
        "comment": "string",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 5. BOOKING SYSTEM

#### 5.1 Database Schema

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    lawyer_id UUID REFERENCES lawyers(id) ON DELETE CASCADE NOT NULL,
    court_id UUID REFERENCES courts(id),
    police_station_id UUID REFERENCES police_stations(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'rescheduled', 'completed', 'cancelled', 'refunded')),
    original_description TEXT NOT NULL CHECK (char_length(original_description) <= 200),
    ai_summary TEXT NOT NULL,
    consultation_fee INTEGER NOT NULL,
    platform_commission INTEGER NOT NULL,
    lawyer_payout INTEGER NOT NULL,
    scheduled_time TIMESTAMP,
    completed_at TIMESTAMP,
    cancellation_reason TEXT,
    reschedule_count INTEGER DEFAULT 0 CHECK (reschedule_count <= 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_lawyer_id ON bookings(lawyer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_time ON bookings(scheduled_time);
CREATE INDEX idx_booking_history_booking_id ON booking_history(booking_id);
```

#### 5.2 Create Booking (Step 1: Case Description)
**Endpoint:** `POST /api/bookings/create`

**Headers:** `Authorization: Bearer {user_token}`

**Request Body:**
```json
{
  "lawyer_id": "uuid",
  "court_id": "uuid (optional)",
  "police_station_id": "uuid (optional)",
  "case_description": "string (max 200 chars, required)",
  "preferred_time": "ISO 8601 timestamp (optional)"
}
```

**Implementation:**

**Step 1: Validate Input**
- Verify user authentication
- Validate lawyer exists and is verified
- Validate case_description length (1-200 chars)
- Check either court_id OR police_station_id is provided (not both)

**Step 2: Generate AI Summary using Gemini**
```python
import google.generativeai as genai

async def generate_case_summary(description: str) -> str:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    prompt = f"""You are a legal assistant helping to summarize case descriptions for lawyers.

Given the following case description from a user (maximum 200 characters), generate a clear, professional summary that captures the key legal issues and relevant details.

User's Description:
"{description}"

Generate a concise summary (100-150 words) that:
1. Identifies the main legal issue
2. Highlights key facts
3. Notes any urgency or time sensitivity
4. Uses professional legal terminology where appropriate
5. Is objective and factual

Summary:"""

    model = genai.GenerativeModel('gemini-pro')
    response = await model.generate_content_async(prompt)
    
    return response.text.strip()
```

**Step 3: Return Preview to User**
```json
{
  "success": true,
  "data": {
    "booking_draft_id": "uuid (store in Redis temporarily)",
    "original_description": "user's input",
    "ai_summary": "generated summary",
    "lawyer_name": "string",
    "consultation_fee": 3000,
    "expires_at": "ISO 8601 (15 minutes from now)"
  }
}
```

**Redis Storage:**
```python
# Store draft in Redis with 15-minute expiry
redis_key = f"booking_draft:{draft_id}"
redis_data = {
    "user_id": user_id,
    "lawyer_id": lawyer_id,
    "court_id": court_id,
    "police_station_id": police_station_id,
    "original_description": case_description,
    "ai_summary": ai_summary,
    "consultation_fee": lawyer.consultation_fee,
    "preferred_time": preferred_time
}
await redis.setex(redis_key, 900, json.dumps(redis_data))  # 15 minutes
```

#### 5.3 Regenerate AI Summary
**Endpoint:** `POST /api/bookings/regenerate-summary`

**Headers:** `Authorization: Bearer {user_token}`

**Request Body:**
```json
{
  "booking_draft_id": "uuid",
  "updated_description": "string (max 200 chars)"
}
```

**Implementation:**
- Fetch draft from Redis
- Validate ownership (user_id matches)
- Generate new AI summary with updated description
- Update Redis draft
- Return new summary

#### 5.4 Confirm Booking & Pay
**Endpoint:** `POST /api/bookings/confirm`

**Headers:** `Authorization: Bearer {user_token}`

**Request Body:**
```json
{
  "booking_draft_id": "uuid"
}
```

**Implementation:**

**Step 1: Fetch Draft from Redis**
```python
draft_data = await redis.get(f"booking_draft:{booking_draft_id}")
if not draft_data:
    raise HTTPException(status_code=404, detail="Booking draft expired")
draft = json.loads(draft_data)
```

**Step 2: Create Razorpay Order**
```python
import razorpay

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Calculate amounts (all in paise: 1 INR = 100 paise)
consultation_fee = draft["consultation_fee"] * 100  # e.g., 3000 INR = 300000 paise
platform_commission = int(consultation_fee * 0.10)  # 10%
lawyer_payout = consultation_fee - platform_commission

order_data = {
    "amount": consultation_fee,
    "currency": "INR",
    "receipt": f"booking_{booking_id}",
    "notes": {
        "booking_id": str(booking_id),
        "user_id": str(user_id),
        "lawyer_id": str(lawyer_id)
    }
}

razorpay_order = client.order.create(data=order_data)
```

**Step 3: Create Booking Record**
```python
booking = await db.execute(
    """
    INSERT INTO bookings (
        user_id, lawyer_id, court_id, police_station_id,
        original_description, ai_summary, consultation_fee,
        platform_commission, lawyer_payout, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
    RETURNING *
    """,
    user_id, lawyer_id, court_id, police_station_id,
    draft["original_description"], draft["ai_summary"],
    consultation_fee, platform_commission, lawyer_payout
)
```

**Step 4: Create Payment Record**
```python
await db.execute(
    """
    INSERT INTO payments (
        booking_id, amount, status, razorpay_order_id
    ) VALUES ($1, $2, 'pending', $3)
    """,
    booking_id, consultation_fee, razorpay_order["id"]
)
```

**Step 5: Delete Draft from Redis**
```python
await redis.delete(f"booking_draft:{booking_draft_id}")
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "razorpay_order_id": "order_xxx",
    "amount": 300000,
    "currency": "INR",
    "razorpay_key_id": "rzp_xxx"
  }
}
```

#### 5.5 Verify Payment (Webhook + Client-side)
**Endpoint:** `POST /api/payments/verify`

**Request Body:**
```json
{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string"
}
```

**Implementation:**

**Step 1: Verify Signature**
```python
import hmac
import hashlib

def verify_razorpay_signature(order_id, payment_id, signature):
    message = f"{order_id}|{payment_id}"
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(generated_signature, signature)

if not verify_razorpay_signature(order_id, payment_id, signature):
    raise HTTPException(status_code=400, detail="Invalid signature")
```

**Step 2: Update Payment & Booking Status**
```python
await db.execute(
    """
    UPDATE payments 
    SET status = 'captured', 
        razorpay_payment_id = $1,
        captured_at = CURRENT_TIMESTAMP
    WHERE razorpay_order_id = $2
    """,
    payment_id, order_id
)

# Booking stays in 'pending' status (waiting for lawyer to accept)
```

**Step 3: Create Escrow Entry**
```python
await db.execute(
    """
    INSERT INTO escrow (booking_id, amount, held_until)
    VALUES ($1, $2, NULL)
    """,
    booking_id, consultation_fee
)
```

**Step 4: Notify Lawyer**
```python
await send_notification(
    user_id=lawyer_id,
    type="new_booking_request",
    title="New Consultation Request",
    message=f"You have a new booking request for ₹{consultation_fee/100}",
    email=True,
    sms=True
)
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified. Waiting for lawyer to accept booking."
}
```

**Razorpay Webhook (for redundancy):**
```
POST /api/webhooks/razorpay
```

Verify webhook signature and process payment.captured event same as above.

---

### 6. LAWYER BOOKING MANAGEMENT

#### 6.1 Get Pending Booking Requests
**Endpoint:** `GET /api/lawyers/bookings/pending`

**Headers:** `Authorization: Bearer {lawyer_token}`

**Implementation:**
- Extract lawyer_id from JWT
- Query bookings with status='pending' for this lawyer
- Include user details (anonymized until accepted)
- Order by created_at DESC

**Response:**
```json
<invoke name="artifacts">
<parameter name="command">update</parameter>
<parameter name="id">legal_booking_prompt</parameter>
<parameter name="old_str">**Response:**
````json</parameter>
<parameter name="new_str">**Response:**
```json
{
  "success": true,
  "data": [
    {
      "booking_id": "uuid",
      "user_name": "string (anonymized: J***n D***)",
      "original_description": "string",
      "ai_summary": "string",
      "consultation_fee": 3000,
      "preferred_time": "ISO 8601 (if provided)",
      "court_name": "string",
      "police_station_name": "string",
      "created_at": "ISO 8601"
    }
  ]
}
```
### 6.2 Accept/Reject/Reschedule Booking
**Endpoint:** POST /api/lawyers/bookings/{booking_id}/respond
**Headers:** Authorization: Bearer {lawyer_token}
Request Body:
json{
  "action": "accept | reject | reschedule",
  "scheduled_time": "ISO 8601 (required if action=accept or reschedule)",
  "rejection_reason": "string (required if action=reject)"
}
Implementation:
For Accept:
python# Validate scheduled_time is in future
if scheduled_time <= datetime.now():
    raise HTTPException(400, "Scheduled time must be in future")

# Update booking
await db.execute(
    """
    UPDATE bookings 
    SET status = 'accepted',
        scheduled_time = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND lawyer_id = $3 AND status = 'pending'
    """,
    scheduled_time, booking_id, lawyer_id
)

# Create booking history
await db.execute(
    """
    INSERT INTO booking_history (booking_id, status, changed_by, notes)
    VALUES ($1, 'accepted', $2, $3)
    """,
    booking_id, lawyer_id, f"Scheduled for {scheduled_time}"
)

# Send notifications
await send_notification(
    user_id=user_id,
    type="booking_accepted",
    title="Booking Confirmed",
    message=f"Your consultation is scheduled for {scheduled_time}",
    email=True,
    sms=True
)

# Schedule reminder notifications (1 hour before)
await schedule_reminder(booking_id, scheduled_time - timedelta(hours=1))
For Reject:
python# Update booking
await db.execute(
    """
    UPDATE bookings 
    SET status = 'rejected',
        cancellation_reason = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND lawyer_id = $3 AND status = 'pending'
    """,
    rejection_reason, booking_id, lawyer_id
)

# Process refund automatically
await process_refund(booking_id)

# Send notification
await send_notification(
    user_id=user_id,
    type="booking_rejected",
    title="Booking Declined",
    message=f"Lawyer declined your booking. Reason: {rejection_reason}. Full refund processed.",
    email=True,
    sms=True
)
For Reschedule:
python# Check reschedule count
booking = await db.fetchrow("SELECT reschedule_count FROM bookings WHERE id = $1", booking_id)
if booking["reschedule_count"] >= 2:
    raise HTTPException(400, "Maximum reschedule limit reached (2)")

# Update booking
await db.execute(
    """
    UPDATE bookings 
    SET status = 'rescheduled',
        scheduled_time = $1,
        reschedule_count = reschedule_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND lawyer_id = $3
    """,
    scheduled_time, booking_id, lawyer_id
)

# Send notification to user with option to accept or request refund
await send_notification(
    user_id=user_id,
    type="booking_rescheduled",
    title="Consultation Rescheduled",
    message=f"Lawyer proposed new time: {scheduled_time}. Accept or request refund.",
    email=True,
    sms=True,
    action_buttons=[
        {"label": "Accept", "action": "accept_reschedule"},
        {"label": "Request Refund", "action": "request_refund"}
    ]
)
6.3 User: Accept Reschedule or Request Refund
Endpoint: POST /api/bookings/{booking_id}/reschedule-response
Headers: Authorization: Bearer {user_token}
Request Body:
json{
  "action": "accept | refund"
}
Implementation:

If accept: Change status from 'rescheduled' to 'accepted'
If refund: Change status to 'cancelled', process refund


7. REFUND SYSTEM
7.1 Process Refund
Function: async def process_refund(booking_id: str, refund_percentage: float = 1.0)
Implementation:
pythonasync def process_refund(booking_id: str, refund_percentage: float = 1.0):
    # Fetch booking and payment details
    booking = await db.fetchrow(
        "SELECT * FROM bookings WHERE id = $1", booking_id
    )
    payment = await db.fetchrow(
        "SELECT * FROM payments WHERE booking_id = $1 AND status = 'captured'",
        booking_id
    )
    
    if not payment:
        raise Exception("No captured payment found")
    
    # Calculate refund amount
    refund_amount = int(payment["amount"] * refund_percentage)
    
    # Process refund via Razorpay
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    
    refund = client.payment.refund(
        payment["razorpay_payment_id"],
        {
            "amount": refund_amount,
            "speed": "normal",  # or "optimum" for faster processing
            "notes": {
                "booking_id": str(booking_id),
                "reason": "Lawyer rejected / User cancelled"
            }
        }
    )
    
    # Update payment record
    await db.execute(
        """
        UPDATE payments 
        SET refund_amount = $1,
            refund_id = $2,
            refund_status = 'processed',
            refunded_at = CURRENT_TIMESTAMP
        WHERE booking_id = $3
        """,
        refund_amount, refund["id"], booking_id
    )
    
    # Update booking status
    await db.execute(
        """
        UPDATE bookings 
        SET status = 'refunded',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        """,
        booking_id
    )
    
    # Delete from escrow
    await db.execute("DELETE FROM escrow WHERE booking_id = $1", booking_id)
    
    # Send notification
    await send_notification(
        user_id=booking["user_id"],
        type="refund_processed",
        title="Refund Processed",
        message=f"₹{refund_amount/100} refunded to your account. Will reflect in 5-7 days.",
        email=True,
        sms=True
    )
    
    return refund
Refund Scenarios:

Lawyer rejects: 100% refund (refund_percentage=1.0)
User cancels before acceptance: 80% refund (refund_percentage=0.8)
User cancels after acceptance: No refund (refund_percentage=0)


8. CONSULTATION SYSTEM (Chat, Voice, Video)
8.1 Database Schema
sqlCREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    agora_channel_name VARCHAR(255) NOT NULL UNIQUE,
    agora_recording_sid VARCHAR(255),
    recording_s3_url TEXT,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultations_booking_id ON consultations(booking_id);
CREATE INDEX idx_chat_messages_booking_id ON chat_messages(booking_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
8.2 Start Consultation
Endpoint: POST /api/consultations/{booking_id}/start
Headers: Authorization: Bearer {token}
Implementation:
Step 1: Validate Booking
pythonbooking = await db.fetchrow(
    """
    SELECT * FROM bookings 
    WHERE id = $1 AND status = 'accepted'
    AND (user_id = $2 OR lawyer_id = $2)
    """,
    booking_id, user_id
)

if not booking:
    raise HTTPException(404, "Booking not found or not accepted")

# Check if scheduled time is near (within 10 minutes)
if booking["scheduled_time"]:
    time_diff = abs((booking["scheduled_time"] - datetime.now()).total_seconds())
    if time_diff > 600:  # 10 minutes
        raise HTTPException(400, "Consultation can only start within 10 minutes of scheduled time")
Step 2: Create Agora Channel
pythonfrom agora_token_builder import RtcTokenBuilder
import time

# Generate unique channel name
channel_name = f"consultation_{booking_id}"

# Generate Agora RTC token (valid for 24 hours)
uid = 0  # 0 means any user can join
expiration_time = int(time.time()) + 86400  # 24 hours

token = RtcTokenBuilder.buildTokenWithUid(
    app_id=AGORA_APP_ID,
    app_certificate=AGORA_APP_CERTIFICATE,
    channel_name=channel_name,
    uid=uid,
    role=1,  # 1 = host, 2 = audience (use 1 for both user and lawyer)
    privilege_expired_ts=expiration_time
)
Step 3: Start Cloud Recording
pythonimport aiohttp

async def start_agora_recording(channel_name: str, booking_id: str):
    # Acquire recording resource
    acquire_url = f"https://api.agora.io/v1/apps/{AGORA_APP_ID}/cloud_recording/acquire"
    acquire_payload = {
        "cname": channel_name,
        "uid": "999",  # Recording bot UID
        "clientRequest": {
            "resourceExpiredHour": 24
        }
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            acquire_url,
            json=acquire_payload,
            auth=aiohttp.BasicAuth(AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET)
        ) as response:
            acquire_result = await response.json()
            resource_id = acquire_result["resourceId"]
    
    # Start recording
    start_url = f"https://api.agora.io/v1/apps/{AGORA_APP_ID}/cloud_recording/resourceid/{resource_id}/mode/mix/start"
    start_payload = {
        "cname": channel_name,
        "uid": "999",
        "clientRequest": {
            "token": token,  # Use same RTC token
            "recordingConfig": {
                "maxIdleTime": 30,
                "streamTypes": 2,  # 0=audio only, 1=video only, 2=both
                "channelType": 0,  # 0=communication, 1=live broadcast
                "videoStreamType": 0,  # 0=high stream, 1=low stream
                "subscribeUidGroup": 0
            },
            "storageConfig": {
                "vendor": 1,  # 1=AWS S3
                "region": 14,  # 14=ap-south-1 (Mumbai)
                "bucket": AWS_S3_BUCKET,
                "accessKey": AWS_ACCESS_KEY,
                "secretKey": AWS_SECRET_KEY,
                "fileNamePrefix": [f"recordings/{booking_id}"]
            }
        }
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            start_url,
            json=start_payload,
            auth=aiohttp.BasicAuth(AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET)
        ) as response:
            start_result = await response.json()
            recording_sid = start_result["sid"]
            
    return resource_id, recording_sid
Step 4: Create Consultation Record
pythonresource_id, recording_sid = await start_agora_recording(channel_name, booking_id)

await db.execute(
    """
    INSERT INTO consultations (
        booking_id, agora_channel_name, agora_recording_sid, started_at
    ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    """,
    booking_id, channel_name, recording_sid
)
Response:
json{
  "success": true,
  "data": {
    "channel_name": "consultation_uuid",
    "agora_token": "token_string",
    "agora_app_id": "app_id",
    "uid": 0
  }
}
8.3 Send Chat Message
Endpoint: POST /api/consultations/{booking_id}/messages
Headers: Authorization: Bearer {token}
Request Body:
json{
  "message": "string (max 2000 chars)"
}
Implementation:
python# Validate sender is part of booking
booking = await db.fetchrow(
    "SELECT user_id, lawyer_id FROM bookings WHERE id = $1",
    booking_id
)

if user_id not in [booking["user_id"], booking["lawyer_id"]]:
    raise HTTPException(403, "Not authorized")

# Insert message
message = await db.fetchrow(
    """
    INSERT INTO chat_messages (booking_id, sender_id, message)
    VALUES ($1, $2, $3)
    RETURNING *
    """,
    booking_id, user_id, message_text
)

# Send real-time notification via WebSocket (if implemented)
# Or use polling for MVP
8.4 Get Chat Messages
Endpoint: GET /api/consultations/{booking_id}/messages
Headers: Authorization: Bearer {token}
Query Parameters:

page: integer (default: 1)
limit: integer (default: 50)

Implementation:

Validate access (user or lawyer of booking)
Fetch messages with pagination
Order by created_at ASC

8.5 End Consultation
Endpoint: POST /api/consultations/{booking_id}/end
Headers: Authorization: Bearer {token}
Implementation:
Step 1: Stop Agora Recording
pythonconsultation = await db.fetchrow(
    "SELECT * FROM consultations WHERE booking_id = $1",
    booking_id
)

stop_url = f"https://api.agora.io/v1/apps/{AGORA_APP_ID}/cloud_recording/resourceid/{consultation['resource_id']}/sid/{consultation['agora_recording_sid']}/mode/mix/stop"

async with aiohttp.ClientSession() as session:
    async with session.post(
        stop_url,
        json={
            "cname": consultation["agora_channel_name"],
            "uid": "999",
            "clientRequest": {}
        },
        auth=aiohttp.BasicAuth(AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET)
    ) as response:
        stop_result = await response.json()
        recording_files = stop_result["serverResponse"]["fileList"]
Step 2: Update Consultation Record
pythonduration = (datetime.now() - consultation["started_at"]).total_seconds()

await db.execute(
    """
    UPDATE consultations 
    SET ended_at = CURRENT_TIMESTAMP,
        duration_seconds = $1,
        recording_s3_url = $2
    WHERE booking_id = $3
    """,
    int(duration), recording_files[0]["fileName"], booking_id
)
Step 3: Auto-complete Booking (or wait for user confirmation)
python# For MVP, auto-complete immediately
# For production, wait for user confirmation or auto-complete after 48 hours

await complete_booking(booking_id)

9. BOOKING COMPLETION & PAYMENT RELEASE
9.1 Complete Booking
Endpoint: POST /api/bookings/{booking_id}/complete
Headers: Authorization: Bearer {user_token}
Implementation:
Step 1: Validate Booking
pythonbooking = await db.fetchrow(
    """
    SELECT * FROM bookings 
    WHERE id = $1 AND user_id = $2 AND status = 'accepted'
    """,
    booking_id, user_id
)

if not booking:
    raise HTTPException(404, "Booking not found")

# Check consultation has ended
consultation = await db.fetchrow(
    "SELECT * FROM consultations WHERE booking_id = $1 AND ended_at IS NOT NULL",
    booking_id
)

if not consultation:
    raise HTTPException(400, "Consultation not yet completed")
Step 2: Update Booking Status
pythonawait db.execute(
    """
    UPDATE bookings 
    SET status = 'completed',
        completed_at = CURRENT_TIMESTAMP
    WHERE id = $1
    """,
    booking_id
)
Step 3: Release Payment to Lawyer
python# Transfer from escrow to lawyer
escrow = await db.fetchrow(
    "SELECT * FROM escrow WHERE booking_id = $1",
    booking_id
)

# Use Razorpay Payouts API to transfer to lawyer's bank account
# First, lawyer must have completed KYC and linked bank account

try:
    payout = client.payout.create({
        "account_number": lawyer_bank_account,
        "fund_account_id": lawyer_fund_account_id,
        "amount": booking["lawyer_payout"],
        "currency": "INR",
        "mode": "IMPS",  # Instant transfer
        "purpose": "payout",
        "queue_if_low_balance": True,
        "reference_id": f"booking_{booking_id}",
        "narration": f"Consultation fee - Booking {booking_id[:8]}"
    })
    
    # Record payout
    await db.execute(
        """
        UPDATE escrow 
        SET released_at = CURRENT_TIMESTAMP,
            payout_id = $1,
            payout_status = 'processed'
        WHERE booking_id = $2
        """,
        payout["id"], booking_id
    )
    
except Exception as e:
    # If payout fails, mark for manual processing
    await db.execute(
        """
        UPDATE escrow 
        SET payout_status = 'pending_manual_review',
            payout_error = $1
        WHERE booking_id = $2
        """,
        str(e), booking_id
    )
    # Alert admin
    await send_admin_alert(f"Payout failed for booking {booking_id}: {str(e)}")

# Notify lawyer
await send_notification(
    user_id=booking["lawyer_id"],
    type="payment_released",
    title="Payment Received",
    message=f"₹{booking['lawyer_payout']/100} has been transferred to your bank account.",
    email=True
)
9.2 Auto-complete After 48 Hours (Background Job)
Cron Job: Run every hour
pythonasync def auto_complete_bookings():
    # Find bookings that are 48+ hours past scheduled time and still 'accepted'
    bookings = await db.fetch(
        """
        SELECT * FROM bookings 
        WHERE status = 'accepted'
        AND scheduled_time < NOW() - INTERVAL '48 hours'
        AND EXISTS (
            SELECT 1 FROM consultations 
            WHERE consultations.booking_id = bookings.id 
            AND ended_at IS NOT NULL
        )
        """
    )
    
    for booking in bookings:
        try:
            # Complete booking and release payment
            await complete_booking(booking["id"])
            
            # Notify user to leave review
            await send_notification(
                user_id=booking["user_id"],
                type="request_review",
                title="Rate Your Experience",
                message="Please rate your consultation with the lawyer.",
                email=True
            )
        except Exception as e:
            logger.error(f"Auto-complete failed for booking {booking['id']}: {str(e)}")

10. REVIEWS & RATINGS
10.1 Database Schema
sqlCREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    user_id UUID REFERENCES users(id) NOT NULL,
    lawyer_id UUID REFERENCES lawyers(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_lawyer_id ON reviews(lawyer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
10.2 Submit Review
Endpoint: POST /api/bookings/{booking_id}/review
Headers: Authorization: Bearer {user_token}
Request Body:
json{
  "rating": 5,
  "comment": "string (optional, max 1000 chars)"
}
Implementation:
python# Validate booking is completed and by this user
booking = await db.fetchrow(
    """
    SELECT * FROM bookings 
    WHERE id = $1 AND user_id = $2 AND status = 'completed'
    """,
    booking_id, user_id
)

if not booking:
    raise HTTPException(404, "Booking not found or not completed")

# Check if review already exists
existing = await db.fetchone(
    "SELECT id FROM reviews WHERE booking_id = $1",
    booking_id
)

if existing:
    raise HTTPException(400, "Review already submitted")

# Insert review
await db.execute(
    """
    INSERT INTO reviews (booking_id, user_id, lawyer_id, rating, comment)
    VALUES ($1, $2, $3, $4, $5)
    """,
    booking_id, user_id, booking["lawyer_id"], rating, comment
)

# Invalidate lawyer cache (will recalculate average rating on next fetch)
await redis.delete(f"lawyer_profile:{booking['lawyer_id']}")

# Notify lawyer
await send_notification(
    user_id=booking["lawyer_id"],
    type="new_review",
    title="New Review Received",
    message=f"You received a {rating}-star review",
    email=True
)
10.3 Get Lawyer Reviews
Endpoint: GET /api/lawyers/{lawyer_id}/reviews
Query Parameters:

page: integer (default: 1)
limit: integer (default: 10)

Implementation:

Fetch reviews for lawyer
Filter: is_hidden = false
Include anonymized user names
Order by created_at DESC
Return with pagination


11. RAG AI LEGAL ASSISTANT
11.1 Database Schema (Pinecone)
Vector Database Structure:
python# Pinecone index configuration
index_name = "legal-knowledge-base"
dimension = 384  # sentence-transformers dimension
metric = "cosine"

# Metadata structure for each vector
metadata = {
    "document_id": "string",
    "document_type": "bare_act | case_law | procedure | faq",
    "title": "string",
    "source": "string",
    "specialization": ["criminal_law", "civil_law"],
    "keywords": ["theft", "punishment", "ipc"],
    "jurisdiction": "all_india | state_specific",
    "state": "maharashtra | all",
    "effective_date": "2023-01-01",
    "language": "english",
    "chunk_text": "actual content",
    "chunk_index": 0,
    "total_chunks": 5
}
11.2 Chat with AI Assistant
Endpoint: POST /api/ai-assistant/chat
Headers: Authorization: Bearer {token}
Request Body:
json{
  "message": "string (max 500 chars)",
  "context": {
    "user_type": "user | lawyer",
    "specialization": "criminal_law (optional)",
    "location": "state_name (optional)"
  }
}
Implementation:
Step 1: Generate Query Embedding
pythonfrom sentence_transformers import SentenceTransformer

# Load model (cache this globally)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str):
    return embedding_model.encode(text).tolist()

query_embedding = generate_embedding(user_message)
Step 2: Search Pinecone
pythonimport pinecone

pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
index = pinecone.Index("legal-knowledge-base")

# Build filter based on context
filter_dict = {}
if context.get("specialization"):
    filter_dict["specialization"] = {"$in": [context["specialization"]]}
if context.get("location"):
    filter_dict["$or"] = [
        {"jurisdiction": "all_india"},
        {"state": context["location"]}
    ]

# Search for top 5 relevant chunks
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True,
    filter=filter_dict if filter_dict else None
)
Step 3: Prepare Context for Gemini
python# Extract relevant chunks
context_chunks = []
sources = []

for match in results["matches"]:
    if match["score"] > 0.7:  # Only use high-confidence matches
        chunk_data = match["metadata"]
        context_chunks.append(f"Source: {chunk_data['title']}\n{chunk_data['chunk_text']}")
        sources.append({
            "title": chunk_data["title"],
            "source": chunk_data["source"],
            "document_type": chunk_data["document_type"]
        })

context_text = "\n\n---\n\n".join(context_chunks)
Step 4: Generate Response with Gemini
pythonimport google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)

user_type_instruction = (
    "for general legal information"
    if user_type == "user"
    else "with detailed legal analysis for a legal professional"
)

prompt = f"""You are a helpful legal assistant for India. Use the following legal information to answer the user's question {user_type_instruction}.

IMPORTANT RULES:
1. Only use information from the provided context
2. If the context doesn't contain enough information, say so clearly
3. Always cite your sources using [Source: {{title}}]
4. Use clear, simple language for users; technical language is okay for lawyers
5. For users: Always end with "⚠️ This is general information, not legal advice. For your specific case, please book a consultation with a verified lawyer."
6. For lawyers: Provide detailed legal analysis with section references

Context:
{context_text}

User Question: {user_message}

Answer:"""

model = genai.GenerativeModel('gemini-pro')
response = await model.generate_content_async(prompt)

ai_response = response.text.strip()
Step 5: Store Conversation (Optional)
python# Store in database for analytics/improvement (anonymized)
await db.execute(
    """
    INSERT INTO ai_chat_logs (user_id, user_type, query, response, sources_used, created_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    """,
    user_id, user_type, user_message, ai_response, json.dumps(sources)
)
Response:
json{
  "success": true,
  "data": {
    "response": "AI-generated answer with citations",
    "sources": [
      {
        "title": "IPC Section 379 - Theft",
        "source": "Indian Penal Code, 1860",
        "document_type": "bare_act"
      }
    ],
    "confidence": "high | medium | low",
    "suggested_action": "book_lawyer (if query suggests user needs consultation)"
  }
}
11.3 Suggest Lawyer (Smart Feature)
If AI detects user needs lawyer consultation:
python# After generating response, analyze if user should book a lawyer
analysis_prompt = f"""Based on this user query: "{user_message}"
And the AI response provided, does the user need to book a lawyer for their specific case?

Respond with JSON only:
{{
  "needs_lawyer": true/false,
  "urgency": "high/medium/low",
  "suggested_specialization": "criminal_law | civil_law | family_law | etc",
  "reason": "brief explanation"
}}"""

analysis_response = await model.generate_content_async(analysis_prompt)
analysis = json.loads(analysis_response.text)

if analysis["needs_lawyer"]:
    # Include in response
    response_data["suggested_action"] = {
        "action": "book_lawyer",
        "urgency": analysis["urgency"],
        "specialization": analysis["suggested_specialization"],
        "message": f"Based on your query, we recommend consulting with a {analysis['suggested_specialization'].replace('_', ' ')} expert. {analysis['reason']}"
    }

12. NOTIFICATIONS SYSTEM
12.1 Database Schema
sqlCREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    sms_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
12.2 Notification Types & Templates
pythonNOTIFICATION_TEMPLATES = {
    "new_booking_request": {
        "title": "New Consultation Request",
        "message": "You have a new booking request forThis response paused because Claude reached its max length for a message. Hit continue to nudge Claude along.ContinueClaude is AI and can make mistakes. Please double-check responses.You are out of free messages until 6:30 AMUpgrade Sonnet 4.5Claude is AI and can make mistakes. Please double-check responses.CopyPublishLEGAL BOOKING SAAS PLATFORM - COMPLETE DEVELOPMENT P

₹{amount}. Review and respond.",
"email_template": "new_booking_email.html",
"sms_template": "New booking request for Rs.{amount}. Check dashboard: {url}"
},
"booking_accepted": {
"title": "Booking Confirmed",
"message": "Your consultation is scheduled for {scheduled_time}.",
"email_template": "booking_confirmed_email.html",
"sms_template": "Consultation confirmed for {time}. Join: {url}"
},
"booking_rejected": {
"title": "Booking Declined",
"message": "Lawyer declined your booking. Reason: {reason}. Full refund processed.",
"email_template": "booking_rejected_email.html",
"sms_template": "Booking declined. Refund processed. Details: {url}"
},
"consultation_reminder_1h": {
"title": "Consultation Starting Soon",
"message": "Your consultation starts in 1 hour. Be ready!",
"email_template": "consultation_reminder_email.html",
"sms_template": "Consultation in 1 hour. Join: {url}"
},
"consultation_reminder_5m": {
"title": "Consultation Starting Now",
"message": "Your consultation is starting. Join now!",
"email_template": None,  # No email for 5-min reminder
"sms_template": "Consultation starting now. Join: {url}"
},
"payment_released": {
"title": "Payment Received",
"message": "₹{amount} has been transferred to your bank account.",
"email_template": "payment_released_email.html",
"sms_template": None
},
"new_review": {
"title": "New Review Received",
"message": "You received a {rating}-star review.",
"email_template": "new_review_email.html",
"sms_template": None
},
"lawyer_verified": {
"title": "Account Activated",
"message": "Congratulations! Your lawyer account has been verified and activated.",
"email_template": "lawyer_verified_email.html",
"sms_template": "Your lawyer account is now active. Start accepting bookings: {url}"
}
}

#### 12.3 Send Notification Function
```python
async def send_notification(
    user_id: str,
    type: str,
    title: str = None,
    message: str = None,
    email: bool = False,
    sms: bool = False,
    **template_vars
):
    # Get user details
    user = await db.fetchrow("SELECT email, phone FROM users WHERE id = $1", user_id)
    
    # Get template
    template = NOTIFICATION_TEMPLATES.get(type)
    if not template:
        raise ValueError(f"Unknown notification type: {type}")
    
    # Format message
    final_title = title or template["title"].format(**template_vars)
    final_message = message or template["message"].format(**template_vars)
    
    # Store in database
    notification_id = await db.fetchval(
        """
        INSERT INTO notifications (user_id, type, title, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        """,
        user_id, type, final_title, final_message
    )
    
    # Send email
    if email and user["email"]:
        try:
            await send_email(
                to=user["email"],
                subject=final_title,
                template=template["email_template"],
                context={**template_vars, "message": final_message}
            )
            await db.execute(
                "UPDATE notifications SET sent_via_email = TRUE, email_sent_at = CURRENT_TIMESTAMP WHERE id = $1",
                notification_id
            )
        except Exception as e:
            logger.error(f"Email send failed: {str(e)}")
    
    # Send SMS
    if sms and user["phone"] and template.get("sms_template"):
        try:
            sms_text = template["sms_template"].format(**template_vars)
            await send_sms(user["phone"], sms_text)
            await db.execute(
                "UPDATE notifications SET sent_via_sms = TRUE, sms_sent_at = CURRENT_TIMESTAMP WHERE id = $1",
                notification_id
            )
        except Exception as e:
            logger.error(f"SMS send failed: {str(e)}")
    
    return notification_id
```

#### 12.4 Email & SMS Integration

**Email (AWS SES):**
```python
import boto3

ses_client = boto3.client(
    'ses',
    region_name='ap-south-1',  # Mumbai
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

async def send_email(to: str, subject: str, template: str, context: dict):
    # Load HTML template
    with open(f"email_templates/{template}", "r") as f:
        html_content = f.read()
    
    # Replace variables
    for key, value in context.items():
        html_content = html_content.replace(f"{{{{{key}}}}}", str(value))
    
    response = ses_client.send_email(
        Source="noreply@yourdomain.com",
        Destination={"ToAddresses": [to]},
        Message={
            "Subject": {"Data": subject},
            "Body": {
                "Html": {"Data": html_content}
            }
        }
    )
    
    return response
```

**SMS (MSG91 for India):**
```python
import aiohttp

async def send_sms(phone: str, message: str):
    url = "https://api.msg91.com/api/v5/flow/"
    
    payload = {
        "template_id": MSG91_TEMPLATE_ID,
        "short_url": "1",
        "recipients": [
            {
                "mobiles": phone,
                "var1": message  # Variable in template
            }
        ]
    }
    
    headers = {
        "authkey": MSG91_AUTH_KEY,
        "content-type": "application/json"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as response:
            result = await response.json()
            return result
```

---

### 13. ADMIN PANEL

#### 13.1 Admin Dashboard Stats
**Endpoint:** `GET /api/admin/dashboard`

**Headers:** `Authorization: Bearer {admin_token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 5420,
    "total_lawyers": 342,
    "pending_verifications": 15,
    "total_bookings": 1250,
    "completed_bookings": 980,
    "active_consultations": 8,
    "total_revenue": 245000,
    "this_month_revenue": 45000,
    "avg_booking_value": 3500,
    "top_specializations": [
      {"name": "Family Law", "bookings": 320},
      {"name": "Criminal Law", "bookings": 280}
    ],
    "recent_activity": [...]
  }
}
```

#### 13.2 User Management
**Endpoint:** `GET /api/admin/users`

**Query Parameters:**
- `search`: string (name, email, phone)
- `status`: "active | suspended | deleted"
- `page`, `limit`

**Endpoint:** `POST /api/admin/users/{user_id}/suspend`
**Endpoint:** `POST /api/admin/users/{user_id}/activate`

#### 13.3 Lawyer Management
**Endpoint:** `GET /api/admin/lawyers`

**Query Parameters:**
- `search`, `verification_status`, `page`, `limit`

**Endpoint:** `POST /api/admin/lawyers/{lawyer_id}/suspend`
- Suspends lawyer account (can't accept new bookings)
- Existing bookings continue

#### 13.4 Booking Management
**Endpoint:** `GET /api/admin/bookings`

**Query Parameters:**
- `status`, `date_from`, `date_to`, `page`, `limit`

**Endpoint:** `GET /api/admin/bookings/{booking_id}/details`
- Full booking details including chat logs, recording URLs

#### 13.5 Dispute Resolution
**Endpoint:** `GET /api/admin/disputes`
**Endpoint:** `POST /api/admin/disputes/{dispute_id}/resolve`

---

### 14. FRONTEND IMPLEMENTATION (React + Next.js)

#### 14.1 Project Structure
/frontend
├── /app (Next.js 14 App Router)
│   ├── layout.tsx
│   ├── page.tsx (Homepage)
│   ├── /auth
│   │   ├── /register
│   │   ├── /login
│   │   ├── /verify-otp
│   ├── /dashboard (User dashboard)
│   ├── /lawyer (Lawyer pages)
│   │   ├── /register
│   │   ├── /dashboard
│   │   ├── /bookings
│   ├── /search (Lawyer search)
│   ├── /lawyers/[id] (Lawyer profile)
│   ├── /booking
│   │   ├── /[id]
│   │   ├── /create
│   ├── /consultation/[id]
│   ├── /ai-assistant
│   ├── /admin
│   │   ├── /dashboard
│   │   ├── /lawyers
│   │   ├── /bookings
├── /components
│   ├── /ui (shadcn/ui components)
│   ├── /shared
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   ├── /auth
│   ├── /booking
│   ├── /consultation
│   ├── /ai-chat
├── /lib
│   ├── api.ts (API client)
│   ├── auth.ts (Auth helpers)
│   ├── hooks.ts (Custom React hooks)
├── /contexts
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
├── /public
└── /styles

#### 14.2 Key Components

**API Client (`/lib/api.ts`):**
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle token refresh)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        localStorage.setItem('access_token', data.data.access_token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Auth Context (`/contexts/AuthContext.tsx`):**
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  user_type: 'user' | 'lawyer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUser = async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.data);
    } catch (error) {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email_or_phone: email, password });
    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    setUser(data.data.user);
  };
  
  const logout = async () => {
    await apiClient.post('/auth/logout');
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };
  
  const register = async (registerData: any) => {
    const { data } = await apiClient.post('/auth/register', registerData);
    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    return data.data.user_id;
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Lawyer Search Page (`/app/search/page.tsx`):**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import LawyerCard from '@/components/search/LawyerCard';
import SearchFilters from '@/components/search/SearchFilters';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  const filters = {
    state_id: searchParams.get('state_id'),
    district_id: searchParams.get('district_id'),
    court_id: searchParams.get('court_id'),
    specialization_id: searchParams.get('specialization_id'),
    min_price: searchParams.get('min_price'),
    max_price: searchParams.get('max_price'),
    sort_by: searchParams.get('sort_by') || 'rating_desc',
    page: searchParams.get('page') || '1',
  };
  
  useEffect(() => {
    fetchLawyers();
  }, [searchParams]);
  
  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/lawyers/search', { params: filters });
      setLawyers(data.data.lawyers);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters: any) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) params.set(key, value as string);
    });
    router.push(`/search?${params.toString()}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find a Lawyer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <SearchFilters filters={filters} onChange={handleFilterChange} />
        </div>
        
        {/* Results */}
        <div className="md:col-span-3">
          {loading ? (
            <div>Loading...</div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No lawyers found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Found {pagination.total} lawyers
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {lawyers.map((lawyer) => (
                  <LawyerCard key={lawyer.id} lawyer={lawyer} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="mt-8 flex justify-center">
                  {/* Pagination component */}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Booking Creation Component (`/components/booking/CreateBooking.tsx`):**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  lawyerId: string;
  lawyerName: string;
  consultationFee: number;
}

export default function CreateBooking({ lawyerId, lawyerName, consultationFee }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [draftId, setDraftId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleGenerateSummary = async () => {
    if (description.length < 10 || description.length > 200) {
      alert('Description must be between 10-200 characters');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await apiClient.post('/bookings/create', {
        lawyer_id: lawyerId,
        case_description: description,
      });
      
      setAiSummary(data.data.ai_summary);
      setDraftId(data.data.booking_draft_id);
      setStep(2);
    } catch (error) {
      alert('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegenerateSummary = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/bookings/regenerate-summary', {
        booking_draft_id: draftId,
        updated_description: description,
      });
      
      setAiSummary(data.data.ai_summary);
    } catch (error) {
      alert('Failed to regenerate summary');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmAndPay = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/bookings/confirm', {
        booking_draft_id: draftId,
      });
      
      // Initialize Razorpay
      const options = {
        key: data.data.razorpay_key_id,
        amount: data.data.amount,
        currency: data.data.currency,
        order_id: data.data.razorpay_order_id,
        name: 'Legal Booking Platform',
        description: `Consultation with ${lawyerName}`,
        handler: async (response: any) => {
          // Verify payment
          await apiClient.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          
          router.push(`/booking/${data.data.booking_id}`);
        },
        prefill: {
          name: '', // User name
          email: '', // User email
        },
        theme: {
          color: '#3B82F6',
        },
      };
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Describe Your Case</h2>
          <p className="text-gray-600 mb-4">
            Provide a brief description of your legal issue (10-200 characters)
          </p>
          
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: Need help with property dispute in Kolkata..."
            maxLength={200}
            className="mb-2"
          />
          <div className="text-sm text-gray-500 mb-4">
            {description.length}/200 characters
          </div>
          
          <Button 
            onClick={handleGenerateSummary} 
            disabled={loading || description.length < 10}
            className="w-full"
          >
            {loading ? 'Generating Summary...' : 'Continue'}
          </Button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Review Summary</h2>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Your Description:</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded">{description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">AI-Generated Summary:</h3>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-gray-800">{aiSummary}</p>
            </div>
          </div>
          
          <Alert className="mb-6">
            <AlertDescription>
              This summary will be sent to the lawyer. If it's not accurate, you can edit your description and regenerate.
            </AlertDescription>
          </Alert>
          
          <div className="mb-6">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              className="mb-2"
            />
            <Button 
              onClick={handleRegenerateSummary} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Regenerating...' : 'Edit & Regenerate Summary'}
            </Button>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Consultation Fee:</span>
              <span className="text-2xl font-bold">₹{consultationFee}</span>
            </div>
            
            <Button 
              onClick={handleConfirmAndPay} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : `Pay ₹${consultationFee} & Confirm Booking`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Agora Video Component (`/components/consultation/VideoConsultation.tsx`):**
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';

interface Props {
  bookingId: string;
}

export default function VideoConsultation({ bookingId }: Props) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [joined, setJoined] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    initAgora();
    return () => {
      leaveCall();
    };
  }, []);
  
  const initAgora = async () => {
    try {
      // Get Agora credentials
      const { data } = await apiClient.post(`/consultations/${bookingId}/start`);
      
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setClient(agoraClient);
      
      // Join channel
      await agoraClient.join(
        data.data.agora_app_id,
        data.data.channel_name,
        data.data.agora_token,
        data.data.uid
      );
      
      // Create local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      
      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
      
      // Publish tracks
      await agoraClient.publish([audioTrack, videoTrack]);
      
      setJoined(true);
      
      // Handle remote users
      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });
      
      agoraClient.on('user-unpublished', (user) => {
        // Handle user leaving
      });
      
    } catch (error) {
      console.error('Failed to initialize Agora:', error);
      alert('Failed to start video call');
    }
  };
  
  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };
  
  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };
  
  const leaveCall = async () => {
    if (client) {
      localVideoTrack?.close();
      localAudioTrack?.close();
      await client.leave();
      
      // End consultation on backend
      await apiClient.post(`/consultations/${bookingId}/end`);
    }
  };
  
  return (
    <div className="relative h-screen bg-gray-900">
      {/* Remote Video (full screen) */}
      <div ref={remoteVideoRef} className="w-full h-full"></div>
      
      {/* Local Video (small overlay) */}
      <div ref={localVideoRef} className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden"></div>
      
      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <Button 
          onClick={toggleVideo}
          variant={videoEnabled ? 'default' : 'destructive'}
          className="rounded-full w-16 h-16"
        >
          {videoEnabled ? '📹' : '🚫'}
        </Button>
        
        <Button 
          onClick={toggleAudio}
          variant={audioEnabled ? 'default' : 'destructive'}
          className="rounded-full w-16 h-16"
        >
          {audioEnabled ? '🎤' : '🔇'}
        </Button>
        
        <Button 
          onClick={leaveCall}
          variant="destructive"
          className="rounded-full w-16 h-16"
        >
          ❌
        </Button>
      </div>
    </div>
  );
}
```

---

### 15. DEPLOYMENT & INFRASTRUCTURE

#### 15.1 AWS Infrastructure Setup

**Create VPC and Subnets:**
```bash
# Use AWS CLI or Console
# Create VPC in ap-south-1 (Mumbai)
# Create public and private subnets
# Set up Internet Gateway and NAT Gateway
```

**RDS PostgreSQL Setup:**
```bash
# Instance: db.t3.medium (for MVP)
# Storage: 100GB SSD
# Multi-AZ: Yes (for 99.9% uptime)
# Backup retention: 7 days
# Encryption: Enabled
```

**ElastiCache Redis Setup:**
```bash
# Node type: cache.t3.micro
# Number of nodes: 1 (MVP), 2 (production)
# Encryption: Enabled
```

**EC2 or ECS for Backend:**
```bash
# Option 1: EC2 (simpler for MVP)
# Instance: t3.medium
# Auto Scaling Group: min=2, max=10
# Load Balancer: Application Load Balancer

# Option 2: ECS (better for scaling)
# Fargate tasks: 2 minimum
# Auto-scaling based on CPU/memory
```

**S3 Buckets:**

bash# Bucket 1: documents (encrypted)
# Bucket 2: recordings (encrypted, lifecycle policy: delete after 180 days)
# Bucket 3: static assets (public, CDN-enabled)
15.2 Docker Configuration
Backend Dockerfile:
dockerfileFROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run database migrations
RUN python migrate.py

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
Frontend Dockerfile:
dockerfileFROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
docker-compose.yml (for local development):
yamlversion: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: legal_booking
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://admin:password@postgres:5432/legal_booking
      REDIS_URL: redis://redis:6379
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      AGORA_APP_ID: ${AGORA_APP_ID}
    depends_on:
      - postgres
      - redis
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api
    depends_on:
      - backend

volumes:
  postgres_data:
15.3 Environment Variables
Backend (.env):
bash# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379

# Security
JWT_SECRET_KEY=your-256-bit-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Razorpay
RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=xxx

# Agora
AGORA_APP_ID=xxx
AGORA_APP_CERTIFICATE=xxx
AGORA_CUSTOMER_ID=xxx
AGORA_CUSTOMER_SECRET=xxx

# AI
GEMINI_API_KEY=xxx

# AWS
AWS_ACCESS_KEY=xxx
AWS_SECRET_KEY=xxx
AWS_S3_BUCKET=legal-booking-docs
AWS_REGION=ap-south-1

# Pinecone
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=legal-knowledge-base

# Notifications
SES_FROM_EMAIL=noreply@yourdomain.com
MSG91_AUTH_KEY=xxx
MSG91_TEMPLATE_ID=xxx

# App
APP_NAME=Legal Booking Platform
APP_URL=https://yourdomain.com
Frontend (.env.local):
bashNEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_xxx
NEXT_PUBLIC_AGORA_APP_ID=xxx

16. SECURITY IMPLEMENTATION
16.1 Password Hashing
pythonimport bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )
16.2 JWT Token Generation
pythonfrom datetime import datetime, timedelta
import jwt

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")
16.3 S3 File Encryption
pythonimport boto3

s3_client = boto3.client('s3', region_name='ap-south-1')

def upload_encrypted_file(file_data, bucket, key):
    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=file_data,
        ServerSideEncryption='AES256',  # Server-side encryption
        ACL='private'
    )

def generate_presigned_url(bucket, key, expiration=3600):
    return s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket, 'Key': key},
        ExpiresIn=expiration
    )
16.4 SQL Injection Prevention
python# ALWAYS use parameterized queries
# BAD (vulnerable):
query = f"SELECT * FROM users WHERE email = '{email}'"

# GOOD (safe):
query = "SELECT * FROM users WHERE email = $1"
result = await db.fetchrow(query, email)
16.5 Rate Limiting
pythonfrom fastapi import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")  # 5 attempts per minute
async def login(request: Request):
    # ...login logic
    pass

17. TESTING REQUIREMENTS
17.1 Unit Tests (pytest)
python# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "phone": "+919876543210",
        "password": "Test@1234",
        "user_type": "user"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()["data"]

def test_login_invalid_credentials():
    response = client.post("/api/auth/login", json={
        "email_or_phone": "test@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
17.2 Integration Tests
python# Test complete booking flow
def test_complete_booking_flow():
    # 1. Register user
    # 2. Register lawyer
    # 3. Admin approves lawyer
    # 4. User searches for lawyer
    # 5. User creates booking
    # 6. User pays
    # 7. Lawyer accepts
    # 8. Consultation happens
    # 9. Booking completed
    # 10. Payment released
    pass

18. MONITORING & LOGGING
18.1 Sentry Integration
pythonimport sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,  # 10% of requests
    environment="production"
)
18.2 Structured Logging
pythonimport logging
import json

logger = logging.getLogger("legal_booking")

def log_event(event_type: str, data: dict):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "data": data
    }
    logger.info(json.dumps(log_entry))

# Usage
log_event("booking_created", {
    "booking_id": str(booking_id),
    "user_id": str(user_id),
    "lawyer_id": str(lawyer_id),
    "amount": consultation_fee
})

19. PERFORMANCE OPTIMIZATION
19.1 Database Indexing
sql-- Already included in schema, but ensure these exist:
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_lawyer_id ON bookings(lawyer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_scheduled_time ON bookings(scheduled_time);
19.2 Redis Caching Strategy
pythonasync def get_lawyer_profile(lawyer_id: str):
    # Try cache first
    cache_key = f"lawyer_profile:{lawyer_id}"
    cached_data = await redis.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
    
    # Fetch from database
    lawyer = await db.fetchrow("SELECT * FROM lawyers WHERE id = $1", lawyer_id)
    # ...fetch related data...
    
    # Store in cache (1 hour TTL)
    await redis.setex(cache_key, 3600, json.dumps(lawyer_data))
    
    return lawyer_data
19.3 Database Connection Pooling
pythonimport asyncpg

# Create connection pool
pool = await asyncpg.create_pool(
    dsn=DATABASE_URL,
    min_size=10,
    max_size=20,
    command_timeout=60
)

# Use pool in requests
async def get_user(user_id: str):
    async with pool.acquire() as conn:
        return await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)

20. DATA MIGRATION STRATEGY
20.1 Database Migrations (Alembic)
python# Use Alembic for database migrations
# alembic/versions/001_initial_schema.py

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        # ...all other columns
        sa.PrimaryKeyConstraint('id')
    )
    # ...create all tables

def downgrade():
    op.drop_table('users')
    # ...drop all tables

FINAL IMPLEMENTATION CHECKLIST
Phase 1: Foundation (Week 1-2)

 Set up AWS infrastructure (VPC, RDS, Redis, S3)
 Set up development environment
 Create database schema
 Implement authentication system (register, login, OTP)
 Set up JWT token management
 Create basic API structure

Phase 2: Core Features (Week 3-4)

 Lawyer registration & profile
 Admin verification panel
 Location data (states, districts, courts) - seed database
 Specializations - seed database
 Lawyer search with filters
 Lawyer profile pages

Phase 3: Booking System (Week 5-6)

 Booking creation with AI summary (Gemini integration)
 Razorpay payment integration
 Escrow system
 Lawyer booking management (accept/reject/reschedule)
 Refund system
 Booking status tracking

Phase 4: Consultation (Week 7-8)

 Agora video/voice integration
 In-app chat system
 Recording storage (S3)
 Consultation start/end flows
 Payment release after completion

Phase 5: RAG & AI Assistant (Week 9-10)

 Pinecone setup
 sentence-transformers embedding generation
 RAG query pipeline
 AI chat interface (frontend + backend)
 Legal data processing scripts (for client to use)

Phase 6: Polish & Testing (Week 11-12)

 Reviews & ratings system
 Notifications (email + SMS)
 Admin dashboard with analytics
 Complete frontend UI/UX
 Security audit
 Performance optimization
 Testing (unit + integration)
 Deploy to production


IMPORTANT NOTES FOR ANTIGRAVITY

Use environment variables for all sensitive data (API keys, secrets)
Never hardcode credentials in the codebase
Follow Python type hints throughout the backend
Use async/await for all database and API calls
Implement proper error handling with try-catch blocks
Add logging for all critical operations
Validate all user inputs before processing
Use parameterized SQL queries to prevent SQL injection
Implement rate limiting on all public endpoints
Add comprehensive API documentation using FastAPI's built-in docs


EXPECTED DELIVERABLES
When you build this application, provide:

Backend: Complete FastAPI application with all endpoints
Frontend: Next.js 14 application with all pages and components
Database: SQL migration files for PostgreSQL
Docker: docker-compose.yml for local development
Documentation: README.md with setup instructions
Environment: .env.example files for both backend and frontend
Tests: Basic unit tests for critical functions
Deployment: AWS deployment guide


This prompt provides everything needed to build a production-ready legal booking platform. Generate clean, well-documented, type-safe code following industry best practices.</parameter>Claude is AI and can make mistakes. Please double-check responses.</parameter>

