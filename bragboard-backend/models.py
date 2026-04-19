from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, TIMESTAMP, Table, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base  

# Association Table
shoutout_recipients = Table(
    'shoutout_recipients',
    Base.metadata,
    Column('shoutout_id', Integer, ForeignKey('shoutouts.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    department = Column(String, nullable=True)
    role = Column(String, default="employee")
    avatar_path = Column(String, nullable=True)
    joined_at = Column(TIMESTAMP, default=datetime.utcnow)

    sent_shoutouts = relationship("Shoutout", back_populates="sender")
    received_shoutouts = relationship("Shoutout", secondary=shoutout_recipients, back_populates="recipients")
    reactions = relationship("Reaction", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    reports = relationship("Report", back_populates="reporter") # NEW

class Shoutout(Base):
    __tablename__ = "shoutouts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    image_path = Column(String, nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", back_populates="sent_shoutouts")
    recipients = relationship("User", secondary=shoutout_recipients, back_populates="received_shoutouts")
    reactions = relationship("Reaction", back_populates="shoutout", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="shoutout", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="shoutout", cascade="all, delete-orphan") # NEW

class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) 
    user_id = Column(Integer, ForeignKey("users.id"))
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="reactions")
    shoutout = relationship("Shoutout", back_populates="reactions")

    __table_args__ = (
        UniqueConstraint('user_id', 'shoutout_id', name='unique_user_shoutout_reaction'),
    )

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="comments")
    shoutout = relationship("Shoutout", back_populates="comments")

# --- REPORT TABLE ---
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reason = Column(String, nullable=False)
    resolved = Column(Boolean, default=False)
    
    reporter_id = Column(Integer, ForeignKey("users.id"))
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reporter = relationship("User", back_populates="reports")
    shoutout = relationship("Shoutout", back_populates="reports")