import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings
import logging

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, html_content: str):
    if not settings.SMTP_PASSWORD:
        logger.warning(f"SMTP_PASSWORD not set. Skipping email to {to_email}: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email

    part1 = MIMEText(html_content, "html")
    msg.attach(part1)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")

def booking_confirmed(user_email: str, lawyer_name: str, date_time: str, meet_link: str):
    subject = "Your LegalBook consultation is confirmed"
    meet_str = meet_link if meet_link else "Link pending"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1a73e8;">Booking Confirmed</h2>
        <p>Your consultation with <strong>{lawyer_name}</strong> has been successfully booked.</p>
        <p><strong>Date & Time:</strong> {date_time}</p>
        <p><strong>Google Meet Link:</strong> <a href="{meet_str}" style="color: #1a73e8; font-weight: bold;">{meet_str}</a></p>
        <p>You can also access the meeting link from your Dashboard at the scheduled time.</p>
        <p>Best Regards,<br>The LegalBook Team</p>
      </body>
    </html>
    """
    send_email(user_email, subject, html_content)

def booking_reminder(user_email: str, lawyer_name: str, date_time: str, meet_link: str):
    subject = "Reminder: Your consultation is in 1 hour"
    meet_str = meet_link if meet_link else "Link available in dashboard"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #f59e0b;">Consultation Reminder</h2>
        <p>This is a reminder that your consultation with <strong>{lawyer_name}</strong> will start in approximately 1 hour.</p>
        <p><strong>Date & Time:</strong> {date_time}</p>
        <p><strong>Google Meet Link:</strong> <a href="{meet_str}" style="color: #1a73e8; font-weight: bold;">{meet_str}</a></p>
        <p>Please test your audio and video before joining.</p>
        <p>Best Regards,<br>The LegalBook Team</p>
      </body>
    </html>
    """
    send_email(user_email, subject, html_content)

def payment_receipt(user_email: str, amount: float, booking_id: str):
    subject = "Payment received - LegalBook"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #10b981;">Payment Receipt</h2>
        <p>We have successfully received your payment of <strong>₹{amount}</strong>.</p>
        <p><strong>Booking Reference ID:</strong> {booking_id}</p>
        <p>Your transaction has been securely processed and your booking is confirmed.</p>
        <p>Best Regards,<br>The LegalBook Team</p>
      </body>
    </html>
    """
    send_email(user_email, subject, html_content)

def password_reset(user_email: str, token: str):
    subject = "Reset your LegalBook password"
    # Ideally frontend URL should come from settings, hardcoding for now based on standard setup
    frontend_url = "http://localhost:3000" if settings.BACKEND_CORS_ORIGINS and "http://localhost:3000" in settings.BACKEND_CORS_ORIGINS else "https://legal-booking-platform.vercel.app"
    
    # Try to extract the first valid frontend origin
    if settings.BACKEND_CORS_ORIGINS:
        first_origin = settings.BACKEND_CORS_ORIGINS[0]
        if first_origin and not first_origin.startswith("["):
             frontend_url = first_origin
             
    reset_link = f"{frontend_url}/auth/reset/{token}"

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1a73e8;">Password Reset Request</h2>
        <p>We received a request to reset the password for your LegalBook account associated with this email.</p>
        <p>Click the secure link below to choose a new password. This link will expire in 30 minutes.</p>
        <p style="margin: 20px 0;">
            <a href="{reset_link}" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="{reset_link}" style="color: #1a73e8; word-break: break-all;">{reset_link}</a></p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>Best Regards,<br>The LegalBook Team</p>
      </body>
    </html>
    """
    send_email(user_email, subject, html_content)
