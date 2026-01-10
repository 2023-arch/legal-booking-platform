from pydantic import BaseModel

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PaymentResponse(BaseModel):
    booking_id: str
    razorpay_order_id: str
    amount: int
    currency: str
    razorpay_key_id: str
