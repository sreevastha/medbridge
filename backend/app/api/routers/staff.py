from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.models.business import StaffMember
from app.api.routers.auth import get_current_user
from app.models.user import Lab

router = APIRouter(prefix="/api/staff", tags=["staff"])

class StaffCreate(BaseModel):
    name: str
    email: str
    role: str

@router.get("")
async def get_staff(current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffMember).where(StaffMember.lab_id == current_user.id))
    return result.scalars().all()

@router.post("")
async def add_staff(data: StaffCreate, current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = StaffMember(name=data.name, email=data.email, role=data.role, lab_id=current_user.id)
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member

@router.delete("/{staff_id}")
async def remove_staff(staff_id: int, current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffMember).where(StaffMember.id == staff_id, StaffMember.lab_id == current_user.id))
    member = result.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    await db.delete(member)
    await db.commit()
    return {"ok": True}
