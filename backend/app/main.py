"""FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import select

from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models.base import Base

# Import all models so Base knows about them before create_all
import app.models.user
import app.models.business
from app.models.business import TestCatalogue, Transaction, Patient, StaffMember
from app.models.user import Lab

from app.api.routers import health, auth, admin, catalogue, staff


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data
    async with SessionLocal() as session:
        # Seed test catalogue if empty
        result = await session.execute(select(TestCatalogue))
        if not result.scalars().first():
            tests = [
                TestCatalogue(name="Complete Blood Count", category="Haematology", description="18 parameters"),
                TestCatalogue(name="Lipid Profile", category="Biochemistry", description="fasting"),
                TestCatalogue(name="HbA1c", category="Diabetes monitoring", description=""),
                TestCatalogue(name="Thyroid Profile (T3 T4 TSH)", category="Hormones", description=""),
                TestCatalogue(name="Liver Function Test", category="Biochemistry", description="11 parameters"),
                TestCatalogue(name="Kidney Function Test", category="Biochemistry", description=""),
            ]
            session.add_all(tests)
            await session.commit()

        # Seed transactions for the first lab (demo only)
        lab_result = await session.execute(select(Lab).limit(1))
        lab = lab_result.scalars().first()
        txn_result = await session.execute(select(Transaction))

        if lab and not txn_result.scalars().first():
            test_result = await session.execute(select(TestCatalogue))
            all_tests = test_result.scalars().all()
            if all_tests:
                p1 = Patient(name="Anjali Deshpande", phone="9876543210", lab_id=lab.id)
                p2 = Patient(name="Anil Sharma", phone="9876543211", lab_id=lab.id)
                p3 = Patient(name="Meera Iyer", phone="9876543212", lab_id=lab.id)
                session.add_all([p1, p2, p3])
                await session.commit()

                session.add_all([
                    Transaction(txn_id_str="TXN-9041", patient_id=p1.id, test_id=all_tests[0].id, lab_id=lab.id, status="shared", incentive=25.0),
                    Transaction(txn_id_str="TXN-9040", patient_id=p2.id, test_id=all_tests[1].id, lab_id=lab.id, status="shared", incentive=25.0),
                    Transaction(txn_id_str="TXN-9039", patient_id=p3.id, test_id=all_tests[2].id, lab_id=lab.id, status="shared", incentive=25.0),
                    Transaction(txn_id_str="TXN-9038", patient_id=p1.id, test_id=all_tests[3].id, lab_id=lab.id, status="failed", incentive=0.0),
                ])
                await session.commit()

    yield


app = FastAPI(title="Layer 1 — ABDM Diagnostics API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(catalogue.router)
app.include_router(staff.router)


@app.get("/")
def root():
    return {"service": "layer1-backend", "docs": "/docs"}
