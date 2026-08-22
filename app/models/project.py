from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime, timezone

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default = lambda: datetime.now(timezone.utc).isoformat(), nullable=False)

    owner = relationship("User", back_populates="projects")
    project_members = relationship("ProjectMember", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

class ProjectMember(Base):
    __tablename__ = "project_members"

    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role = Column(String(10), nullable=False)
    joined_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="project_members")
    project = relationship("Project", back_populates="project_members")