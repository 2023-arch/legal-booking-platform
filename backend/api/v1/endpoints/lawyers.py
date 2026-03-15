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
    bar_council_certificate: UploadFile = File(..., description="Bar Council Certificate (required for verification)"),
    id_proof: UploadFile = File(..., description="ID Proof - Aadhaar/PAN (required for verification)"),
    profile_photo: UploadFile = File(..., description="Professional photo for profile (visible to users)")
):
    """
    Register a new lawyer profile.
    
    All documents are MANDATORY and will be reviewed by admin for verification.
    Profile photo will be visible to users on the lawyer's profile page.
    """
    # Check if user already has a lawyer profile
    query = select(Lawyer).where(Lawyer.user_id == current_user.id)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Lawyer profile already exists")

    # Validate file sizes (Fix #12: prevent oversized uploads)
    MAX_DOC_SIZE = 5 * 1024 * 1024   # 5MB for documents
    MAX_PHOTO_SIZE = 2 * 1024 * 1024  # 2MB for profile photos
    
    for file_obj, max_size, label in [
        (bar_council_certificate, MAX_DOC_SIZE, "Bar Council Certificate"),
        (id_proof, MAX_DOC_SIZE, "ID Proof"),
        (profile_photo, MAX_PHOTO_SIZE, "Profile Photo"),
    ]:
        content = await file_obj.read()
        if len(content) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"{label} exceeds maximum size of {max_size // (1024*1024)}MB"
            )
        await file_obj.seek(0)  # Reset file pointer after reading

    # Upload files (all mandatory)
    cert_url = await storage.upload_file(bar_council_certificate, f"lawyers/{current_user.id}/documents")
    id_proof_url = await storage.upload_file(id_proof, f"lawyers/{current_user.id}/documents")
    photo_url = await storage.upload_file(profile_photo, f"lawyers/{current_user.id}/profile")

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

    # Add Courts (skip invalid UUIDs - frontend may send names instead of UUIDs)
    for c_id in court_ids_list:
        try:
            # Validate it's a proper UUID before adding
            import uuid as uuid_module
            court_uuid = uuid_module.UUID(str(c_id)) if c_id else None
            if court_uuid:
                lc = LawyerCourt(lawyer_id=lawyer.id, court_id=court_uuid)
                db.add(lc)
        except (ValueError, AttributeError):
            # Skip invalid UUIDs (frontend might send court names instead)
            pass

    # Add Specializations (skip invalid UUIDs - frontend may send names instead of UUIDs)
    for s in specs_list:
        try:
            import uuid as uuid_module
            spec_id = s.get('specialization_id')
            spec_uuid = uuid_module.UUID(str(spec_id)) if spec_id else None
            sub_spec_id = s.get('sub_specialization_id')
            sub_spec_uuid = uuid_module.UUID(str(sub_spec_id)) if sub_spec_id else None
            
            if spec_uuid:
                ls = LawyerSpecialization(
                    lawyer_id=lawyer.id, 
                    specialization_id=spec_uuid,
                    sub_specialization_id=sub_spec_uuid
                )
                db.add(ls)
        except (ValueError, AttributeError):
            # Skip invalid UUIDs (frontend might send specialization names instead)
            pass
    
    await db.commit()
    await db.refresh(lawyer)
    
    # Update user type
    current_user.user_type = "lawyer"
    db.add(current_user)
    await db.commit()
    
    return lawyer

@router.get("/search")
async def search_lawyers(
    db: AsyncSession = Depends(deps.get_db),
    query: Optional[str] = None,
    specialization_id: Optional[str] = None,
    court_id: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    limit: int = 20,
    skip: int = 0,
    page: int = 1,
    sort_by: Optional[str] = None,
    state_id: Optional[str] = None,
    district_id: Optional[str] = None,
    min_experience: Optional[str] = None,
    min_rating: Optional[str] = None,
    languages: Optional[str] = None,
    sub_specialization_id: Optional[str] = None,
):
    """
    Search lawyers with filters.
    Returns wrapped response: {data: {lawyers: [...], pagination: {...}}}
    """
    from sqlalchemy.orm import selectinload

    stmt = select(Lawyer).options(
        selectinload(Lawyer.user),
        selectinload(Lawyer.courts).selectinload(LawyerCourt.court),
        selectinload(Lawyer.specializations).selectinload(LawyerSpecialization.specialization).selectinload(Specialization.sub_specializations),
        selectinload(Lawyer.specializations).selectinload(LawyerSpecialization.sub_specialization),
    )
    
    # Only show verified lawyers
    stmt = stmt.where(Lawyer.verification_status == "verified")

    if query:
        # Join User to search by name, and also search specialization name
        stmt = stmt.outerjoin(Lawyer.user.property.mapper.class_, Lawyer.user_id == User.id)
        stmt = stmt.outerjoin(LawyerSpecialization, Lawyer.id == LawyerSpecialization.lawyer_id)
        stmt = stmt.outerjoin(Specialization, LawyerSpecialization.specialization_id == Specialization.id)
        search_term = f"%{query}%"
        stmt = stmt.where(or_(
            Lawyer.bio.ilike(search_term),
            User.full_name.ilike(search_term),
            Specialization.name.ilike(search_term),
        ))
    if min_price:
        stmt = stmt.where(Lawyer.consultation_fee >= min_price)
    if max_price:
        stmt = stmt.where(Lawyer.consultation_fee <= max_price)
    
    if court_id:
        stmt = stmt.join(LawyerCourt).where(LawyerCourt.court_id == court_id)
    if specialization_id:
        stmt = stmt.join(LawyerSpecialization).where(LawyerSpecialization.specialization_id == specialization_id)

    # Count total for pagination
    from sqlalchemy import func as sqla_func
    count_stmt = select(sqla_func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    # Apply pagination
    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)
    result = await db.execute(stmt)
    lawyers_list = result.unique().scalars().all()

    # Build response with name from User
    lawyers_data = []
    for lawyer in lawyers_list:
        lawyer_dict = {
            "id": str(lawyer.id),
            "user_id": str(lawyer.user_id),
            "name": lawyer.user.full_name if lawyer.user else "Unknown",
            "bar_council_number": lawyer.bar_council_number,
            "years_experience": lawyer.years_experience,
            "education": lawyer.education,
            "bio": lawyer.bio,
            "languages": lawyer.languages or [],
            "consultation_fee": lawyer.consultation_fee,
            "verification_status": lawyer.verification_status,
            "profile_photo_url": lawyer.profile_photo_url,
            "average_rating": lawyer.average_rating if hasattr(lawyer, 'average_rating') and lawyer.average_rating else 0.0,
            "total_reviews": lawyer.total_reviews if hasattr(lawyer, 'total_reviews') and lawyer.total_reviews else 0,
            "courts": [],
            "specializations": [],
        }
        lawyers_data.append(lawyer_dict)

    total_pages = max(1, (total + limit - 1) // limit)
    
    return {
        "status": "success",
        "data": {
            "lawyers": lawyers_data,
            "pagination": {
                "total": total,
                "page": page,
                "total_pages": total_pages,
                "per_page": limit,
            }
        }
    }


@router.get("/featured")
async def get_featured_lawyers(
    db: AsyncSession = Depends(deps.get_db),
    limit: int = 6,
):
    """
    Get top-rated verified lawyers for the landing page.
    Returns the same dict structure as /search for frontend compatibility.
    """
    from sqlalchemy.orm import selectinload

    stmt = (
        select(Lawyer)
        .options(
            selectinload(Lawyer.user),
            selectinload(Lawyer.courts).selectinload(LawyerCourt.court),
            selectinload(Lawyer.specializations).selectinload(LawyerSpecialization.specialization).selectinload(Specialization.sub_specializations),
            selectinload(Lawyer.specializations).selectinload(LawyerSpecialization.sub_specialization),
        )
        .where(Lawyer.verification_status == "verified")
        .limit(limit)
    )
    result = await db.execute(stmt)
    lawyers_list = result.unique().scalars().all()

    lawyers_data = []
    for lawyer in lawyers_list:
        lawyers_data.append({
            "id": str(lawyer.id),
            "user_id": str(lawyer.user_id),
            "name": lawyer.user.full_name if lawyer.user else "Unknown",
            "bar_council_number": lawyer.bar_council_number,
            "years_experience": lawyer.years_experience,
            "education": lawyer.education,
            "bio": lawyer.bio,
            "languages": lawyer.languages or [],
            "consultation_fee": lawyer.consultation_fee,
            "verification_status": lawyer.verification_status,
            "profile_photo_url": lawyer.profile_photo_url,
            "average_rating": lawyer.average_rating if hasattr(lawyer, 'average_rating') and lawyer.average_rating else 0.0,
            "total_reviews": lawyer.total_reviews if hasattr(lawyer, 'total_reviews') and lawyer.total_reviews else 0,
            "courts": [],
            "specializations": [],
        })

    return {
        "status": "success",
        "data": {
            "lawyers": lawyers_data,
        }
    }

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


@router.get("/{lawyer_id}")
async def get_lawyer(
    lawyer_id: str,
    db: AsyncSession = Depends(deps.get_db),
):
    """
    Get a single lawyer's full profile by ID.
    Must be placed AFTER all literal routes (/search, /featured, /pending)
    to avoid shadowing them.
    """
    from sqlalchemy.orm import selectinload
    from fastapi.responses import JSONResponse
    import uuid as uuid_module
    import logging
    logger = logging.getLogger(__name__)

    # Validate UUID format
    try:
        lawyer_uuid = uuid_module.UUID(lawyer_id)
    except ValueError:
        return JSONResponse(status_code=400, content={"detail": "Invalid lawyer ID format"})

    try:
        stmt = (
            select(Lawyer)
            .options(
                selectinload(Lawyer.user),
                selectinload(Lawyer.courts).selectinload(LawyerCourt.court),
                selectinload(Lawyer.specializations).selectinload(LawyerSpecialization.specialization).selectinload(Specialization.sub_specializations),
                selectinload(Lawyer.specializations).selectinload(LawyerSpecialization.sub_specialization),
            )
            .where(Lawyer.id == lawyer_uuid)
        )
        result = await db.execute(stmt)
        lawyer = result.unique().scalar_one_or_none()
    except Exception as e:
        logger.error(f"DB query error in get_lawyer: {type(e).__name__}: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"detail": f"DB error: {type(e).__name__}: {str(e)}"})

    if not lawyer:
        return JSONResponse(status_code=404, content={"detail": "Lawyer not found"})

    try:
        # Build courts list
        courts_data = []
        for lc in (lawyer.courts or []):
            if lc.court:
                courts_data.append({"id": str(lc.court.id), "name": lc.court.name})

        # Build specializations list
        specs_data = []
        for ls in (lawyer.specializations or []):
            spec_entry = {}
            if ls.specialization:
                spec_entry["id"] = str(ls.specialization.id)
                spec_entry["name"] = ls.specialization.name
            if ls.sub_specialization:
                spec_entry["sub_specialization"] = {
                    "id": str(ls.sub_specialization.id),
                    "name": ls.sub_specialization.name
                }
            if spec_entry:
                specs_data.append(spec_entry)
    except Exception as e:
        logger.error(f"Relationship serialization error: {type(e).__name__}: {e}", exc_info=True)
        courts_data = []
        specs_data = []

    # Query reviews separately to avoid lazy loading issues
    try:
        from models.review import Review
        from sqlalchemy import func as sqla_func
        review_result = await db.execute(
            select(
                sqla_func.count(Review.id),
                sqla_func.coalesce(sqla_func.avg(Review.rating), 0)
            ).where(Review.lawyer_id == lawyer_uuid)
        )
        row = review_result.one()
        total_reviews = row[0] or 0
        avg_rating = round(float(row[1]), 1)
    except Exception as e:
        logger.error(f"Review query error: {type(e).__name__}: {e}", exc_info=True)
        total_reviews = 0
        avg_rating = 0.0

    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "data": {
                "id": str(lawyer.id),
                "user_id": str(lawyer.user_id),
                "name": lawyer.user.full_name if lawyer.user else "Unknown",
                "email": lawyer.user.email if lawyer.user else None,
                "bar_council_number": lawyer.bar_council_number,
                "years_experience": lawyer.years_experience,
                "education": lawyer.education,
                "bio": lawyer.bio,
                "languages": lawyer.languages or [],
                "consultation_fee": lawyer.consultation_fee,
                "verification_status": lawyer.verification_status,
                "profile_photo_url": lawyer.profile_photo_url,
                "average_rating": avg_rating,
                "total_reviews": total_reviews,
                "courts": courts_data,
                "specializations": specs_data,
            }
        }
    )


