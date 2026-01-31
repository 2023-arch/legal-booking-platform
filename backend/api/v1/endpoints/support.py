"""
Support endpoints for contact form and support tickets.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from api import deps

router = APIRouter()
logger = logging.getLogger(__name__)


class ContactFormRequest(BaseModel):
    name: str
    email: str
    phone: str
    subject: str
    message: str


@router.post("/contact")
async def contact_support(
    *,
    request: ContactFormRequest,
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Handle contact form submissions.
    In production, this would:
    1. Save to support_tickets table
    2. Send email notification to support team
    3. Send confirmation email to user
    """
    # Validate inputs
    if len(request.name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    if len(request.subject) < 5:
        raise HTTPException(status_code=400, detail="Subject must be at least 5 characters")
    if len(request.message) < 20:
        raise HTTPException(status_code=400, detail="Message must be at least 20 characters")
    
    # Log the contact form submission
    logger.info(f"Contact form submission from {request.email}: {request.subject}")
    
    # TODO: In production, save to database and send emails
    # support_ticket = SupportTicket(
    #     name=request.name,
    #     email=request.email,
    #     phone=request.phone,
    #     subject=request.subject,
    #     message=request.message,
    #     status="open"
    # )
    # db.add(support_ticket)
    # await db.commit()
    
    # email_service.send_to_support(request)
    # email_service.send_confirmation(request.email, request.name)
    
    return {
        "success": True,
        "message": "Thank you for contacting us. Our support team will get back to you within 24 hours."
    }


@router.get("/faq")
async def get_faqs():
    """
    Return frequently asked questions.
    """
    faqs = [
        {
            "question": "How do I book a lawyer?",
            "answer": "Search for lawyers by specialization or location, view their profile, and click 'Book Consultation'. You'll be guided through a simple booking process."
        },
        {
            "question": "What if I need to cancel my booking?",
            "answer": "You can cancel your booking up to 24 hours before the scheduled consultation for a full refund. Cancellations within 24 hours may be subject to a cancellation fee."
        },
        {
            "question": "How are payments handled?",
            "answer": "Payments are processed securely through Razorpay and held in escrow until your consultation is complete. This protects both you and the lawyer."
        },
        {
            "question": "How can I verify a lawyer's credentials?",
            "answer": "All lawyers on our platform are verified. We check their Bar Council registration, identity documents, and qualifications before approval."
        },
        {
            "question": "What if I'm not satisfied with the consultation?",
            "answer": "We have a satisfaction guarantee. If you're not satisfied, contact our support team within 48 hours and we'll review your case for a potential refund."
        }
    ]
    
    return {"faqs": faqs}
