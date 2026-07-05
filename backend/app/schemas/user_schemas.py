from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LabCreate(BaseModel):
    facility_name: str
    hfr_id: str
    address: Optional[str] = None
    username: str
    password: str

class LabResponse(BaseModel):
    id: int
    facility_name: str
    hfr_id: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
