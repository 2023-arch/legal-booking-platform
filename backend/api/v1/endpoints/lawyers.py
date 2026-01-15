from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
import json

from api import deps
from core import storage
from models.user import User
from models.lawyer import Lawyer, LawyerCourt, LawyerSpecialization
from models.location import Court
from models.specialization import Specialization
from schemas.lawyer import Lawyer as LawyerSchema, LawyerCreate
from schemas.user import User as UserSchema

router = APIRouter()

@router.post("/register", response_model=LawyerSchema)
async def register_lawyer(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    bar_council_number: str = Form(...),
    years_experience: int = Form(...),
    education: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    languages: str = Form(...), # JSON string list
    consultation_fee: int = Form(...),
    court_ids: str = Form(...), # JSON string list of UUIDs
    specializations: str = Form(...), # JSON string list of objects
    bar_council_certificate: UploadFile = File(...),
    id_proof: UploadFile = File(...),
    profile_photo: UploadFile = File(None)
):
    """
    Register a new lawyer profile.
    """
    # Check if user already has a lawyer profile
    query = select(Lawyer).where(Lawyer.user_id == current_user.id)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Lawyer profile already exists")

    # Upload files
    cert_url = await storage.upload_file_to_s3(bar_council_certificate, f"lawyers/{current_user.id}/documents")
    id_proof_url = await storage.upload_file_to_s3(id_proof, f"lawyers/{current_user.id}/documents")
    photo_url = None
    if profile_photo:
        photo_url = await storage.upload_file_to_s3(profile_photo, f"lawyers/{current_user.id}/documents")

    # Create Lawyer
    try:
        languages_list = json.loads(languages)
        court_ids_list = json.loads(court_ids)
        specs_list = json.loads(specializations)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for list fields")

    lawyer = Lawyer(
        user_id=current_user.id,
        bar_council_number=bar_council_number,
        years_experience=years_experience,
        education=education,
        bio=bio,
        languages=languages_list,
        consultation_fee=consultation_fee,
        bar_council_certificate_url=cert_url,
        id_proof_url=id_proof_url,
        profile_photo_url=photo_url,
        verification_status="pending_verification"
    )
    db.add(lawyer)
    await db.commit()
    await db.refresh(lawyer)

    # Add Courts
    for c_id in court_ids_list:
        lc = LawyerCourt(lawyer_id=lawyer.id, court_id=c_id)
        db.add(lc)

    # Add Specializations
    for s in specs_list:
        ls = LawyerSpecialization(
            lawyer_id=lawyer.id, 
            specialization_id=s['specialization_id'],
            sub_specialization_id=s.get('sub_specialization_id')
        )
        db.add(ls)
    
    await db.commit()
    await db.refresh(lawyer)
    
    # Update user type
    current_user.user_type = "lawyer"
    db.add(current_user)
    await db.commit()
    
    return lawyer

@router.get("/search", response_model=List[LawyerSchema])
async def search_lawyers(
    db: AsyncSession = Depends(deps.get_db),
    query: Optional[str] = None,
    specialization_id: Optional[str] = None,
    court_id: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    limit: int = 20,
    skip: int = 0
):
    """
    Search lawyers with filters.
    """
    stmt = select(Lawyer).where(Lawyer.verification_status == "verified")

    if query:
        stmt = stmt.where(or_(
            Lawyer.bio.ilike(f"%{query}%"),
            # Add join with User to search by name if needed
        ))
    if min_price:
        stmt = stmt.where(Lawyer.consultation_fee >= min_price)
    if max_price:
        stmt = stmt.where(Lawyer.consultation_fee <= max_price)
    
    # Add joins for complex filters (court, specialization)
    if court_id:
        stmt = stmt.join(LawyerCourt).where(LawyerCourt.court_id == court_id)
    if specialization_id:
        stmt = stmt.join(LawyerSpecialization).where(LawyerSpecialization.specialization_id == specialization_id)

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/pending", response_model=List[LawyerSchema])
async def get_pending_lawyers(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get list of lawyers pending verification (Admin only).
    """
    # TODO: Check if user is admin (current_user.is_superuser)
    if not current_user.is_superuser:
         raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(select(Lawyer).where(Lawyer.verification_status == "pending_verification"))
    return result.scalars().all()

@router.post("/{lawyer_id}/verify", response_model=LawyerSchema)
async def verify_lawyer(
    lawyer_id: str,
    action: str = Query(..., regex="^(approve|reject)$"),
    reason: Optional[str] = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Approve or reject a lawyer (Admin only).
    """
    if not current_user.is_superuser:
         raise HTTPException(status_code=403, detail="Not authorized")

    lawyer = await db.get(Lawyer, lawyer_id)
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    if action == "approve":
        from datetime import datetime
        lawyer.verification_status = "verified"
        lawyer.verified_at = datetime.utcnow()
        lawyer.verified_by = current_user.id
        lawyer.user.is_verified = True # Update User level flag too
    else:
        lawyer.verification_status = "rejected"
        lawyer.rejection_reason = reason

    await db.commit()
    await db.refresh(lawyer)
    return lawyer

# Helper to generate signed URLs for response
# Ideally, we should intercept response and sign URLs, or sign them on retrieval
