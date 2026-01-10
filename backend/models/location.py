from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from db.base_class import Base

class State(Base):
    __tablename__ = "states"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    
    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")

class District(Base):
    __tablename__ = "districts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    state_id = Column(UUID(as_uuid=True), ForeignKey("states.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)

    state = relationship("State", back_populates="districts")
    courts = relationship("Court", back_populates="district", cascade="all, delete-orphan")
    police_stations = relationship("PoliceStation", back_populates="district", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint('state_id', 'name', name='uq_district_state_name'),)

class Court(Base):
    __tablename__ = "courts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False) # supreme_court, high_court, district_court, etc.
    address = Column(String, nullable=True)

    district = relationship("District", back_populates="courts")

class PoliceStation(Base):
    __tablename__ = "police_stations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(String, nullable=True)

    district = relationship("District", back_populates="police_stations")
