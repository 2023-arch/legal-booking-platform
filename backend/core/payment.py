import hmac
import hashlib
import uuid
import logging
from core.config import settings

logger = logging.getLogger(__name__)

# Check if we're in test mode (no Razorpay keys configured)
TEST_MODE = not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET

if TEST_MODE:
    logger.warning("⚠️ Razorpay running in TEST MODE - payments will be simulated")
    client = None
else:
    import razorpay
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    logger.info("✅ Razorpay initialized with live credentials")


def create_order(amount: int, currency: str = "INR", notes: dict = None):
    """
    Create a Razorpay order.
    Amount should be in paise.
    In TEST_MODE, returns a mock order.
    """
    if TEST_MODE:
        # Return mock order for testing
        mock_order_id = f"order_TEST_{uuid.uuid4().hex[:16]}"
        logger.info(f"[TEST MODE] Created mock order: {mock_order_id} for amount: {amount}")
        return {
            "id": mock_order_id,
            "amount": amount,
            "currency": currency,
            "status": "created",
            "notes": notes or {}
        }
    
    data = {
        "amount": amount,
        "currency": currency,
        "notes": notes or {}
    }
    return client.order.create(data=data)


def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Verify Razorpay payment signature.
    In TEST_MODE, always returns True for test orders.
    """
    if TEST_MODE:
        # In test mode, accept any signature for test orders
        is_test_order = order_id.startswith("order_TEST_")
        if is_test_order:
            logger.info(f"[TEST MODE] Auto-verifying test payment: {payment_id}")
            return True
        logger.warning(f"[TEST MODE] Non-test order verification attempted: {order_id}")
        return False
    
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
    In TEST_MODE, returns a mock refund.
    """
    if TEST_MODE:
        mock_refund_id = f"rfnd_TEST_{uuid.uuid4().hex[:16]}"
        logger.info(f"[TEST MODE] Mock refund created: {mock_refund_id}")
        return {
            "id": mock_refund_id,
            "payment_id": payment_id,
            "amount": amount,
            "status": "processed"
        }
    
    data = {"notes": notes or {}}
    if amount:
        data["amount"] = amount
        
    return client.payment.refund(payment_id, data)


def is_test_mode() -> bool:
    """Check if payment system is in test mode"""
    return TEST_MODE
