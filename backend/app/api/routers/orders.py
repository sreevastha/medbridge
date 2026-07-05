from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
import random
from app.core.database import get_db
from app.models.business import Transaction, Patient, TestCatalogue
from app.api.routers.auth import get_current_user
from app.models.user import Lab

router = APIRouter(prefix="/api/orders", tags=["orders"])

class OrderCreate(BaseModel):
    patient_id: int
    test_ids: List[int]

class TransactionResponse(BaseModel):
    id: int
    txn_id_str: str
    patient_id: int
    test_id: int
    status: str
    incentive: Optional[float] = None
    created_at: str

@router.get("")
async def get_orders(current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Load transactions along with patient and test relations
    result = await db.execute(
        select(Transaction)
        .where(Transaction.lab_id == current_user.id)
        .order_by(Transaction.created_at.desc())
    )
    txns = result.scalars().all()
    
    orders = []
    for t in txns:
        # Load relations explicitly
        pat_res = await db.execute(select(Patient).where(Patient.id == t.patient_id))
        pat = pat_res.scalars().first()
        
        test_res = await db.execute(select(TestCatalogue).where(TestCatalogue.id == t.test_id))
        test_val = test_res.scalars().first()
        
        orders.append({
            "id": t.id,
            "txn_id_str": t.txn_id_str,
            "patient_name": pat.name if pat else "Unknown Patient",
            "test_name": test_val.name if test_val else "Unknown Test",
            "status": t.status,
            "incentive": t.incentive or 0.0,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else ""
        })
    return orders

@router.post("")
async def create_orders(data: OrderCreate, current_user: Lab = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify patient exists
    pat_res = await db.execute(select(Patient).where(Patient.id == data.patient_id, Patient.lab_id == current_user.id))
    patient = pat_res.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    created_txns = []
    for test_id in data.test_ids:
        # Verify test exists
        test_res = await db.execute(select(TestCatalogue).where(TestCatalogue.id == test_id))
        test_val = test_res.scalars().first()
        if not test_val:
            continue
            
        txn_id_str = f"ORD-{random.randint(1000, 9999)}"
        txn = Transaction(
            txn_id_str=txn_id_str,
            patient_id=patient.id,
            test_id=test_id,
            lab_id=current_user.id,
            status="pending", # Starts as pending (awaiting pathologist review/sign-off)
            incentive=0.0
        )
        db.add(txn)
        created_txns.append(txn)
        
    await db.commit()
    return {"ok": True, "count": len(created_txns)}
