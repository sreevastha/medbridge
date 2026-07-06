from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models.business import Transaction, Patient, TestCatalogue
from app.api.routers.auth import get_current_user
from app.models.user import Lab

router = APIRouter(prefix="/api/reports", tags=["reports"])

from sqlalchemy.orm import selectinload

@router.get("")
async def get_reports(current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Fetch pending transactions that need signature with eagerly loaded relations
    result = await db.execute(
        select(Transaction)
        .where(Transaction.lab_id == current_user.id)
        .options(selectinload(Transaction.patient), selectinload(Transaction.test))
        .order_by(Transaction.created_at.desc())
    )
    txns = result.scalars().all()
    
    reports = []
    for t in txns:
        reports.append({
            "id": t.id,
            "txn_id_str": t.txn_id_str,
            "patient_name": t.patient.name if t.patient else "Unknown",
            "patient_age": t.patient.age if t.patient else 0,
            "patient_gender": t.patient.gender if t.patient else "Unknown",
            "patient_abha": t.patient.abha_id if t.patient else "",
            "test_name": t.test.name if t.test else "Unknown",
            "status": t.status,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else ""
        })
    return reports

@router.post("/{txn_id}/sign")
async def sign_report(txn_id: int, current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.id == txn_id, Transaction.lab_id == current_user.id)
    )
    txn = result.scalars().first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    txn.status = "shared"
    txn.incentive = 25.0  # ₹25 incentive earned on successful ABDM upload/sign-off
    await db.commit()
    return {"ok": True}
