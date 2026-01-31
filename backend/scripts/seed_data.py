"""
Database Seeding Script for Legal Booking Platform
Creates sample lawyers, states, districts, courts, and specializations.
Idempotent - safe to run multiple times without creating duplicates.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from db.session import AsyncSessionLocal
from models.user import User
from models.lawyer import Lawyer, LawyerCourt, LawyerSpecialization
from models.location import State, District, Court
from models.specialization import Specialization

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============================================================================
# SEED DATA
# ============================================================================

STATES_DATA = [
    {"name": "Maharashtra", "code": "MH"},
    {"name": "Delhi", "code": "DL"},
    {"name": "Karnataka", "code": "KA"},
    {"name": "Telangana", "code": "TS"},
    {"name": "Gujarat", "code": "GJ"},
    {"name": "Tamil Nadu", "code": "TN"},
    {"name": "West Bengal", "code": "WB"},
    {"name": "Uttar Pradesh", "code": "UP"},
    {"name": "Rajasthan", "code": "RJ"},
    {"name": "Kerala", "code": "KL"},
]

DISTRICTS_DATA = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Delhi": ["New Delhi", "South Delhi", "North Delhi"],
    "Karnataka": ["Bangalore Urban", "Mysore", "Mangalore"],
    "Telangana": ["Hyderabad", "Secunderabad", "Warangal"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri"],
    "Uttar Pradesh": ["Lucknow", "Noida", "Varanasi"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode"],
}

COURTS_DATA = {
    "Maharashtra": [
        {"name": "Bombay High Court", "type": "high_court", "district": "Mumbai"},
        {"name": "Mumbai City Civil Court", "type": "district_court", "district": "Mumbai"},
        {"name": "Pune District Court", "type": "district_court", "district": "Pune"},
    ],
    "Delhi": [
        {"name": "Delhi High Court", "type": "high_court", "district": "New Delhi"},
        {"name": "Saket District Court", "type": "district_court", "district": "South Delhi"},
        {"name": "Tis Hazari Courts Complex", "type": "district_court", "district": "North Delhi"},
    ],
    "Karnataka": [
        {"name": "Karnataka High Court", "type": "high_court", "district": "Bangalore Urban"},
        {"name": "Bangalore City Civil Court", "type": "district_court", "district": "Bangalore Urban"},
    ],
    "Telangana": [
        {"name": "Telangana High Court", "type": "high_court", "district": "Hyderabad"},
        {"name": "Hyderabad City Civil Court", "type": "district_court", "district": "Hyderabad"},
    ],
    "Gujarat": [
        {"name": "Gujarat High Court", "type": "high_court", "district": "Ahmedabad"},
        {"name": "Ahmedabad City Civil Court", "type": "district_court", "district": "Ahmedabad"},
    ],
    "West Bengal": [
        {"name": "Calcutta High Court", "type": "high_court", "district": "Kolkata"},
        {"name": "Alipore District Court", "type": "district_court", "district": "Kolkata"},
    ],
}

SPECIALIZATIONS_DATA = [
    {"name": "Criminal Defense", "description": "Defense in criminal cases including bail, trials, appeals"},
    {"name": "Family Law", "description": "Divorce, custody, alimony, and family disputes"},
    {"name": "Corporate Law", "description": "Company formation, M&A, contracts, and compliance"},
    {"name": "Property Law", "description": "Real estate transactions, disputes, and registration"},
    {"name": "Civil Litigation", "description": "Civil disputes, claims, and court proceedings"},
    {"name": "Cyber Crime", "description": "Online fraud, hacking, data breaches, and digital crimes"},
    {"name": "IP Law", "description": "Patents, trademarks, copyrights, and trade secrets"},
    {"name": "Consumer Law", "description": "Consumer complaints, refunds, and product liability"},
    {"name": "Tax Law", "description": "Income tax, GST, tax planning, and disputes"},
    {"name": "Labor Law", "description": "Employment disputes, wages, and workplace issues"},
]

LAWYERS_DATA = [
    {
        "full_name": "Advocate Rajesh Kumar",
        "email": "rajesh.kumar@legal.com",
        "phone": "+919876543210",
        "password": "Test@123456",
        "bar_council_number": "MH/2009/123456",
        "years_experience": 15,
        "education": "LLB from Mumbai University, LLM from NLU",
        "bio": "Experienced criminal lawyer specializing in white-collar crimes and complex trials. Successfully handled 200+ cases including high-profile fraud and cybercrime matters.",
        "languages": ["Hindi", "English", "Marathi"],
        "consultation_fee": 2500,
        "specializations": ["Criminal Defense", "Civil Litigation"],
        "state": "Maharashtra",
        "district": "Mumbai",
        "profile_photo_url": "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
    {
        "full_name": "Advocate Priya Sharma",
        "email": "priya.sharma@legal.com",
        "phone": "+919876543211",
        "password": "Test@123456",
        "bar_council_number": "DL/2014/789012",
        "years_experience": 10,
        "education": "BA LLB from Delhi University, Family Law Certification",
        "bio": "Expert in family law matters and divorce proceedings with a compassionate approach. Specializes in mediation and out-of-court settlements.",
        "languages": ["Hindi", "English", "Punjabi"],
        "consultation_fee": 2000,
        "specializations": ["Family Law"],
        "state": "Delhi",
        "district": "New Delhi",
        "profile_photo_url": "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
    {
        "full_name": "Advocate Arjun Reddy",
        "email": "arjun.reddy@legal.com",
        "phone": "+919876543212",
        "password": "Test@123456",
        "bar_council_number": "TS/2016/345678",
        "years_experience": 8,
        "education": "LLB from Osmania University, Corporate Law Specialization",
        "bio": "Corporate lawyer with expertise in M&A and contracts. Advises startups and established businesses on legal compliance and deal structuring.",
        "languages": ["Telugu", "Hindi", "English"],
        "consultation_fee": 3000,
        "specializations": ["Corporate Law", "IP Law"],
        "state": "Telangana",
        "district": "Hyderabad",
        "profile_photo_url": "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
    {
        "full_name": "Advocate Sneha Patel",
        "email": "sneha.patel@legal.com",
        "phone": "+919876543213",
        "password": "Test@123456",
        "bar_council_number": "GJ/2012/901234",
        "years_experience": 12,
        "education": "LLB from Gujarat University, Real Estate Law Certificate",
        "bio": "Real estate and property law specialist with extensive experience in land acquisition, title verification, and property disputes.",
        "languages": ["Gujarati", "Hindi", "English"],
        "consultation_fee": 2200,
        "specializations": ["Property Law", "Civil Litigation"],
        "state": "Gujarat",
        "district": "Ahmedabad",
        "profile_photo_url": "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
    {
        "full_name": "Advocate Vikram Singh",
        "email": "vikram.singh@legal.com",
        "phone": "+919876543214",
        "password": "Test@123456",
        "bar_council_number": "KA/2018/112233",
        "years_experience": 6,
        "education": "LLB from NLSIU Bangalore, Cybersecurity Law Certification",
        "bio": "Cyber law and intellectual property expert. Handles cases involving online fraud, data protection, and technology-related disputes.",
        "languages": ["Kannada", "Hindi", "English"],
        "consultation_fee": 2800,
        "specializations": ["Cyber Crime", "IP Law"],
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "profile_photo_url": "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
]


async def seed_states(db: AsyncSession) -> dict:
    """Seed states and return mapping of name to ID"""
    print("\n📍 Seeding States...")
    state_map = {}
    
    for state_data in STATES_DATA:
        # Check if exists
        result = await db.execute(select(State).where(State.code == state_data["code"]))
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"  ✓ State {state_data['name']} already exists")
            state_map[state_data["name"]] = existing.id
        else:
            state = State(**state_data)
            db.add(state)
            await db.flush()
            state_map[state_data["name"]] = state.id
            print(f"  + Created state: {state_data['name']}")
    
    return state_map


async def seed_districts(db: AsyncSession, state_map: dict) -> dict:
    """Seed districts and return mapping of (state, name) to ID"""
    print("\n🏘️ Seeding Districts...")
    district_map = {}
    
    for state_name, districts in DISTRICTS_DATA.items():
        state_id = state_map.get(state_name)
        if not state_id:
            print(f"  ⚠ Skipping districts for {state_name} - state not found")
            continue
            
        for district_name in districts:
            result = await db.execute(
                select(District).where(
                    District.state_id == state_id,
                    District.name == district_name
                )
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                district_map[(state_name, district_name)] = existing.id
            else:
                district = District(state_id=state_id, name=district_name)
                db.add(district)
                await db.flush()
                district_map[(state_name, district_name)] = district.id
                print(f"  + Created district: {district_name} ({state_name})")
    
    return district_map


async def seed_courts(db: AsyncSession, district_map: dict) -> dict:
    """Seed courts and return mapping of name to ID"""
    print("\n⚖️ Seeding Courts...")
    court_map = {}
    
    for state_name, courts in COURTS_DATA.items():
        for court_data in courts:
            district_key = (state_name, court_data["district"])
            district_id = district_map.get(district_key)
            
            if not district_id:
                print(f"  ⚠ Skipping court {court_data['name']} - district not found")
                continue
            
            result = await db.execute(
                select(Court).where(Court.name == court_data["name"])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                court_map[court_data["name"]] = existing.id
            else:
                court = Court(
                    district_id=district_id,
                    name=court_data["name"],
                    type=court_data["type"]
                )
                db.add(court)
                await db.flush()
                court_map[court_data["name"]] = court.id
                print(f"  + Created court: {court_data['name']}")
    
    return court_map


async def seed_specializations(db: AsyncSession) -> dict:
    """Seed specializations and return mapping of name to ID"""
    print("\n📚 Seeding Specializations...")
    spec_map = {}
    
    for spec_data in SPECIALIZATIONS_DATA:
        result = await db.execute(
            select(Specialization).where(Specialization.name == spec_data["name"])
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            spec_map[spec_data["name"]] = existing.id
        else:
            spec = Specialization(**spec_data)
            db.add(spec)
            await db.flush()
            spec_map[spec_data["name"]] = spec.id
            print(f"  + Created specialization: {spec_data['name']}")
    
    return spec_map


async def seed_lawyers(
    db: AsyncSession, 
    district_map: dict, 
    court_map: dict, 
    spec_map: dict
):
    """Seed sample lawyers with verified status"""
    print("\n👨‍⚖️ Seeding Lawyers...")
    
    for lawyer_data in LAWYERS_DATA:
        # Check if user exists
        result = await db.execute(
            select(User).where(User.email == lawyer_data["email"])
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"  ✓ Lawyer {lawyer_data['full_name']} already exists")
            continue
        
        # Create user
        user = User(
            full_name=lawyer_data["full_name"],
            email=lawyer_data["email"],
            phone=lawyer_data["phone"],
            hashed_password=pwd_context.hash(lawyer_data["password"]),
            is_active=True,
            is_verified=True,
            user_type="lawyer"
        )
        db.add(user)
        await db.flush()
        
        # Create lawyer profile
        lawyer = Lawyer(
            user_id=user.id,
            bar_council_number=lawyer_data["bar_council_number"],
            years_experience=lawyer_data["years_experience"],
            education=lawyer_data["education"],
            bio=lawyer_data["bio"],
            languages=lawyer_data["languages"],
            consultation_fee=lawyer_data["consultation_fee"],
            verification_status="verified",
            bar_council_certificate_url=lawyer_data["profile_photo_url"],
            id_proof_url=lawyer_data["profile_photo_url"],
            profile_photo_url=lawyer_data["profile_photo_url"],
        )
        db.add(lawyer)
        await db.flush()
        
        # Add specializations
        for spec_name in lawyer_data["specializations"]:
            spec_id = spec_map.get(spec_name)
            if spec_id:
                lawyer_spec = LawyerSpecialization(
                    lawyer_id=lawyer.id,
                    specialization_id=spec_id
                )
                db.add(lawyer_spec)
        
        # Add court association
        district_key = (lawyer_data["state"], lawyer_data["district"])
        if district_key in district_map:
            # Find a court in the same state
            for court_name, court_id in court_map.items():
                if lawyer_data["state"] in court_name or any(
                    c["name"] == court_name 
                    for c in COURTS_DATA.get(lawyer_data["state"], [])
                ):
                    lawyer_court = LawyerCourt(
                        lawyer_id=lawyer.id,
                        court_id=court_id
                    )
                    db.add(lawyer_court)
                    break
        
        print(f"  + Created lawyer: {lawyer_data['full_name']}")


async def main():
    """Main seeding function"""
    print("=" * 60)
    print("🌱 Legal Booking Platform - Database Seeding")
    print("=" * 60)
    
    async with AsyncSessionLocal() as db:
        try:
            # Seed in order of dependencies
            state_map = await seed_states(db)
            district_map = await seed_districts(db, state_map)
            court_map = await seed_courts(db, district_map)
            spec_map = await seed_specializations(db)
            await seed_lawyers(db, district_map, court_map, spec_map)
            
            # Commit all changes
            await db.commit()
            
            print("\n" + "=" * 60)
            print("✅ Seeding completed successfully!")
            print("=" * 60)
            print(f"\nSummary:")
            print(f"  • States: {len(state_map)}")
            print(f"  • Districts: {len(district_map)}")
            print(f"  • Courts: {len(court_map)}")
            print(f"  • Specializations: {len(spec_map)}")
            print(f"  • Lawyers: {len(LAWYERS_DATA)}")
            
        except Exception as e:
            await db.rollback()
            print(f"\n❌ Error during seeding: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
