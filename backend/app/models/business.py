from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class StaffMember(Base):
    __tablename__ = "staff_members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="invited")  # invited, active
    lab_id = Column(Integer, ForeignKey("labs.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    lab = relationship("Lab", backref="staff")



class TestCatalogue(Base):
    __tablename__ = "test_catalogue"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    lab_id = Column(Integer, ForeignKey("labs.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lab = relationship("Lab", backref="patients")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    txn_id_str = Column(String, unique=True, nullable=False)  # e.g. TXN-9041
    patient_id = Column(Integer, ForeignKey("patients.id"))
    test_id = Column(Integer, ForeignKey("test_catalogue.id"))
    lab_id = Column(Integer, ForeignKey("labs.id"))
    
    status = Column(String, default="shared")  # shared, pending, failed
    incentive = Column(Float, nullable=True)   # amount e.g. 25.0
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", backref="transactions")
    test = relationship("TestCatalogue")
    lab = relationship("Lab", backref="transactions")
