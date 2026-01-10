from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, backref
import uuid
from db.base_class import Base

class Specialization(Base):
    __tablename__ = "specializations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("specializations.id"), nullable=True)
    description = Column(Text, nullable=True)

    parent = relationship("Specialization", remote_side=[id], backref=backref("sub_specializations", lazy="dynamic"))
