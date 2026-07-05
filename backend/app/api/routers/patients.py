from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.models.business import Patient
from app.api.routers.auth import get_current_user
from app.models.user import Lab

router = APIRouter(prefix="/api/patients", tags=["patients"])

class PatientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    abha_id: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    abha_id: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[PatientResponse])
async def get_patients(current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.lab_id == current_user.id).order_by(Patient.created_at.desc()))
    return result.scalars().all()

@router.post("", response_model=PatientResponse)
async def create_patient(data: PatientCreate, current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    patient = Patient(
        name=data.name,
        phone=data.phone,
        age=data.age,
        gender=data.gender,
        abha_id=data.abha_id,
        lab_id=current_user.id
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient
