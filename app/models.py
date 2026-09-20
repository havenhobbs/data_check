"""
SQLAlchemy models

Defining the schema here means the same code works against SQLite or PostgreSQL by changing one connection string.

"""

from pathlib import Path
from sqlalchemy import (Column, Integer, String, DateTime, ForeignKey, create_engine)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()

#absolute path so the same database file is used
DB_PATH = Path(__file__).parent.parent / "data_check.db"

class Patient(Base):
    __tablename__ = "patients"
    
    patient_id = Column(Integer, primary_key=True)
    mrn = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(DateTime, nullable=False)
    gender = Column(String)
    
    encounters = relationship("Encounter", back_populates="patient")
    
class Provider(Base):
    __tablename__ = "providers"
    
    provider_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    title = Column(String)
    department = Column(String, nullable=False)
    
    encounters = relationship("Encounter", back_populates="provider")
    
class Encounter(Base):
    __tablename__ = "encounters"
    
    encounter_id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=True)
    provider_id = Column(Integer, ForeignKey("providers.provider_id"), nullable=True)
    scheduled_datetime = Column(DateTime, nullable=True)
    encounter_type = Column(String)
    status = Column(String)
    department = Column(String)
    
    #nullable=True on foreign keys is intentional so that we can allow the validator to work
    
    patient = relationship("Patient", back_populates="encounters")
    provider = relationship("Provider", back_populates="encounters")
    
def get_engine(db_path=None):
    if db_path is None: 
        db_path = f"sqlite:///{DB_PATH}"
    return create_engine(db_path)

def init_db(engine):
    Base.metadata.create_all(engine)
    
def get_session(engine):
    Session = sessionmaker(bind=engine)
    return Session()