from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.business import TestCatalogue

router = APIRouter(prefix="/api/catalogue", tags=["catalogue"])

@router.get("/tests")
async def get_tests(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TestCatalogue))
    tests = result.scalars().all()
    return tests
