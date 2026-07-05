from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import Lab
from app.schemas.user_schemas import LabCreate, LabResponse, Token

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/register", response_model=LabResponse)
async def register(lab_data: LabCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lab).where(Lab.username == lab_data.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    result_hfr = await db.execute(select(Lab).where(Lab.hfr_id == lab_data.hfr_id))
    if result_hfr.scalars().first():
        raise HTTPException(status_code=400, detail="HFR ID already registered")

    hashed_password = hash_password(lab_data.password)
    db_lab = Lab(
        facility_name=lab_data.facility_name,
        hfr_id=lab_data.hfr_id,
        address=lab_data.address,
        username=lab_data.username,
        password_hash=hashed_password
    )
    db.add(db_lab)
    await db.commit()
    await db.refresh(db_lab)
    return db_lab

@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lab).where(Lab.username == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.username, "lab_id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from jose import JWTError, jwt
from app.core.config import settings
from app.schemas.user_schemas import TokenData

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    result = await db.execute(select(Lab).where(Lab.username == token_data.username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

