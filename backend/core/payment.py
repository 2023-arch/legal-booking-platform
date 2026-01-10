import razorpay
from core.config import settings
import hmac
import hashlib

# Initialize Razorpay client
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def create_order(amount: int, currency: str = "INR", notes: dict = None):
    """
    Create a Razorpay order.
    Amount should be in paise.
    """
    data = {
        "amount": amount,
        "currency": currency,
        "notes": notes or {}
    }
    return client.order.create(data=data)

def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Verify Razorpay payment signature.
    """
    message = f"{order_id}|{payment_id}"
    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(generated_signature, signature)

def refund_payment(payment_id: str, amount: int = None, notes: dict = None):
    """
    Refund a payment.
    """
    data = {"notes": notes or {}}
    if amount:
        data["amount"] = amount
        
    return client.payment.refund(payment_id, data)
