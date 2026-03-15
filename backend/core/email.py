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
