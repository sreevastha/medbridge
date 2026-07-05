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

@router.get("")
async def get_reports(current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Fetch pending transactions that need signature
    result = await db.execute(
        select(Transaction)
        .where(Transaction.lab_id == current_user.id)
        .order_by(Transaction.created_at.desc())
    )
    txns = result.scalars().all()
    
    reports = []
    for t in txns:
        pat_res = await db.execute(select(Patient).where(Patient.id == t.patient_id))
        pat = pat_res.scalars().first()
        
        test_res = await db.execute(select(TestCatalogue).where(TestCatalogue.id == t.test_id))
        test_val = test_res.scalars().first()
        
        reports.append({
            "id": t.id,
            "txn_id_str": t.txn_id_str,
            "patient_name": pat.name if pat else "Unknown",
            "patient_age": pat.age if pat else 0,
            "patient_gender": pat.gender if pat else "Unknown",
            "patient_abha": pat.abha_id if pat else "",
            "test_name": test_val.name if test_val else "Unknown",
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
