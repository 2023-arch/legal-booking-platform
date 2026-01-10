from db.base_class import Base

# Import all models here for Alembic/metadata
from models.user import User
from models.location import State, District, Court, PoliceStation
from models.specialization import Specialization
from models.lawyer import Lawyer, LawyerCourt, LawyerSpecialization
from models.booking import Booking, BookingHistory
from models.payment import Payment, Escrow
from models.consultation import Consultation
from models.chat import Message
from models.review import Review
from models.notification import Notification
