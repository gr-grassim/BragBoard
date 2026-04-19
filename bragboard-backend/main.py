from datetime import datetime, timedelta
from typing import List, Optional
import shutil
import os
import csv
import io 

from jose import jwt, JWTError
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.responses import StreamingResponse # NEW: To download files
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles 
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from passlib.context import CryptContext
import models, schemas
from database import engine, get_db

# Creation of Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login") 
SECRET_KEY = "supersecretkey123" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- AUTH HELPERS ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_password_hash(password):
    return pwd_context.hash(password)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None: raise HTTPException(status_code=401)
    return user


@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(name=user.name, email=user.email, password=get_password_hash(user.password), department=user.department, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not pwd_context.verify(user_credentials.password, user.password):
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    return {"access_token": create_access_token(data={"sub": user.email, "role": user.role}), "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.patch("/users/me", response_model=schemas.UserOut)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if user_update.name: current_user.name = user_update.name
    if user_update.department: current_user.department = user_update.department
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/users/me/avatar", response_model=schemas.UserOut)
def upload_avatar(avatar: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    safe_filename = f"avatar_{current_user.id}_{datetime.now().timestamp()}.jpg"
    file_location = f"static/images/{safe_filename}"
    with open(file_location, "wb+") as file_object: shutil.copyfileobj(avatar.file, file_object)
    current_user.avatar_path = f"http://localhost:8000/{file_location}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/users/", response_model=List[schemas.UserOut])
def read_users(department: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.User)
    if department and department != "All Departments":
        query = query.filter(models.User.department == department)
    return query.all()

# --- SHOUTOUT ENDPOINTS ---
@app.post("/shoutouts", response_model=schemas.ShoutoutOut)
def create_shoutout(content: str = Form(...), receiver_ids: str = Form(...), image: Optional[UploadFile] = File(None), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    image_url = None
    if image:
        safe_filename = f"{datetime.now().timestamp()}_{image.filename}"
        file_location = f"static/images/{safe_filename}"
        with open(file_location, "wb+") as file_object: shutil.copyfileobj(image.file, file_object)
        image_url = f"http://localhost:8000/{file_location}"
    
    recipient_ids = [int(id) for id in receiver_ids.split(",") if id.strip()]
    recipients = db.query(models.User).filter(models.User.id.in_(recipient_ids)).all()
    
    db_shoutout = models.Shoutout(content=content, sender_id=current_user.id, image_path=image_url, recipients=recipients)
    db.add(db_shoutout)
    db.commit()
    db.refresh(db_shoutout)
    return db_shoutout

@app.get("/shoutouts", response_model=List[schemas.ShoutoutOut])
def get_shoutouts(db: Session = Depends(get_db)):
    return db.query(models.Shoutout).order_by(models.Shoutout.created_at.desc()).all()

@app.delete("/shoutouts/{shoutout_id}")
def delete_shoutout(shoutout_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    shoutout = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()
    if not shoutout: raise HTTPException(status_code=404, detail="Shoutout not found")
    
    if shoutout.sender_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.delete(shoutout)
    db.commit()
    return {"message": "Shoutout deleted"}

@app.patch("/shoutouts/{shoutout_id}", response_model=schemas.ShoutoutOut)
def update_shoutout(shoutout_id: int, update: schemas.ShoutoutUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    shoutout = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()
    if not shoutout: raise HTTPException(status_code=404, detail="Shoutout not found")
    
    if shoutout.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    shoutout.content = update.content
    db.commit()
    db.refresh(shoutout)
    return shoutout

# --- INTERACTION ENDPOINTS ---
@app.post("/shoutouts/{shoutout_id}/react", response_model=schemas.ReactionOut)
def toggle_reaction(shoutout_id: int, reaction: schemas.ReactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.Reaction).filter(models.Reaction.user_id == current_user.id, models.Reaction.shoutout_id == shoutout_id).first()
    if existing:
        if existing.type == reaction.type:
            db.delete(existing)
            db.commit()
            return existing
        existing.type = reaction.type
        db.commit()
        db.refresh(existing)
        return existing
    new_react = models.Reaction(type=reaction.type, user_id=current_user.id, shoutout_id=shoutout_id)
    db.add(new_react)
    db.commit()
    db.refresh(new_react)
    return new_react

@app.post("/shoutouts/{shoutout_id}/comments", response_model=schemas.CommentOut)
def create_comment(shoutout_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    shoutout = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()
    if not shoutout: raise HTTPException(status_code=404, detail="Shoutout not found")
    new_comment = models.Comment(content=comment.content, user_id=current_user.id, shoutout_id=shoutout_id)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment: raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}

@app.patch("/comments/{comment_id}", response_model=schemas.CommentOut)
def update_comment(comment_id: int, update: schemas.CommentUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment: raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")
    comment.content = update.content
    db.commit()
    db.refresh(comment)
    return comment

# --- ADMIN & REPORT ENDPOINTS ---

@app.post("/shoutouts/{shoutout_id}/report", response_model=schemas.ReportOut)
def report_shoutout(shoutout_id: int, report: schemas.ReportCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_report = models.Report(reason=report.reason, reporter_id=current_user.id, shoutout_id=shoutout_id)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@app.get("/admin/reports", response_model=List[schemas.ReportOut])
def get_reports(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    return db.query(models.Report).filter(models.Report.resolved == False).all()

@app.post("/admin/reports/{report_id}/resolve")
def resolve_report(report_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report: raise HTTPException(status_code=404, detail="Report not found")
    report.resolved = True
    db.commit()
    return {"message": "Report resolved"}


# ---Public Leaderboard Endpoint (Accessible to everyone)---
@app.get("/leaderboard", response_model=schemas.AdminStats)
def get_public_leaderboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Top Contributors (Most shoutouts sent)
    top_senders = db.query(models.User.name, func.count(models.Shoutout.id).label('count'))\
        .join(models.Shoutout, models.User.id == models.Shoutout.sender_id)\
        .group_by(models.User.name).order_by(desc('count')).limit(5).all()
        
    # 2. Most Tagged (Most shoutouts received)
    most_received = db.query(models.User.name, func.count(models.shoutout_recipients.c.shoutout_id).label('count'))\
        .join(models.shoutout_recipients, models.User.id == models.shoutout_recipients.c.user_id)\
        .group_by(models.User.name).order_by(desc('count')).limit(5).all()

    return {
        "top_contributors": [{"name": name, "count": count} for name, count in top_senders],
        "most_tagged": [{"name": name, "count": count} for name, count in most_received]
    }

# Admin Stats (Re-uses the logic from Leaderboard, but restricted)
@app.get("/admin/stats", response_model=schemas.AdminStats)
def get_admin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    return get_public_leaderboard(db, current_user)

# --- EXPORT CSV ---

@app.get("/admin/export/shoutouts")
def export_shoutouts_csv(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    
    shoutouts = db.query(models.Shoutout).all()
    
    # Creating in-memory file
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Writeing Header
    writer.writerow(['ID', 'Date', 'Sender', 'Recipients', 'Content', 'Reactions'])
    
    # Writing Rows
    for s in shoutouts:
        recipients_str = ", ".join([r.name for r in s.recipients])
        writer.writerow([s.id, s.created_at, s.sender.name, recipients_str, s.content, len(s.reactions)])
        
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment;filename=shoutouts_report.csv"}
    )

@app.get("/admin/export/users")
def export_users_csv(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    
    users = db.query(models.User).all()
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['ID', 'Name', 'Email', 'Department', 'Role', 'Joined At'])
    
    for u in users:
        writer.writerow([u.id, u.name, u.email, u.department, u.role, u.joined_at])
        
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment;filename=users_report.csv"}
    )

@app.get("/admin/export/reports")
def export_reports_csv(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    
    reports = db.query(models.Report).all()
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['ID', 'Reason', 'Resolved', 'Reporter', 'Shoutout ID', 'Shoutout Content'])
    
    for r in reports:
        writer.writerow([r.id, r.reason, r.resolved, r.reporter.name, r.shoutout_id, r.shoutout.content])
        
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment;filename=reports_export.csv"}
    )