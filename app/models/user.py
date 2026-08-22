from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(100), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(10), default="USER")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default = lambda: datetime.now(timezone.utc).isoformat(), nullable=False)

    projects = relationship("Project", back_populates="owner")
    project_members = relationship("ProjectMember", back_populates="users")
    tasks = relationship("Task", back_populates="user")
