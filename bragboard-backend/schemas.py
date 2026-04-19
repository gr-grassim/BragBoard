from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    department: Optional[str] = None
    role: str = "employee"

class UserCreate(UserBase):
    name: str
    password: str

class UserOut(UserBase):
    id: int
    name: str
    avatar_path: Optional[str] = None 
    class Config:
        from_attributes = True
        
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None

class ReactionCreate(BaseModel):
    type: str

class ReactionOut(BaseModel):
    id: int
    type: str
    user_id: int
    user: UserOut 
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentUpdate(BaseModel):
    content: str

class CommentOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_id: int
    user: UserOut
    class Config:
        from_attributes = True

class ShoutoutUpdate(BaseModel):
    content: str

class ShoutoutOut(BaseModel):
    id: int
    content: str
    image_path: Optional[str] = None 
    created_at: datetime
    sender_id: int
    
    sender: UserOut
    recipients: List[UserOut]
    
    reactions: List[ReactionOut] = []
    comments: List[CommentOut] = [] 

    class Config:
        from_attributes = True

# --- REPORT SCHEMAS ---
class ReportCreate(BaseModel):
    reason: str

class ReportOut(BaseModel):
    id: int
    reason: str
    resolved: bool
    created_at: datetime
    reporter: UserOut
    shoutout: ShoutoutOut
    class Config:
        from_attributes = True

# --- ADMIN STATS SCHEMA ---
class StatItem(BaseModel):
    name: str
    count: int

class AdminStats(BaseModel):
    top_contributors: List[StatItem]
    most_tagged: List[StatItem]