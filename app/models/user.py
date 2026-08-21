from sqlalchemy import Column, Integer, String, Boolean, DATETIME, TEXT, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(100), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(10), default="USER")
    is_active = Column(Boolean, default=True)
    created_at = Column(DATETIME, nullable=False)

    projects = relationship("Project", back_populates="owner")
    project_members = relationship("ProjectMember", back_populates="users")
    tasks = relationship("Task", back_populates="user")
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(TEXT, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DATETIME, nullable=False)

    owner = relationship("User", back_populates="projects")
    project_members = relationship("ProjectMember", back_populates="projects")
    tasks = relationship("Task", back_populates="project")
class ProjectMember(Base):
    __tablename__ = "project_members"

    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role = Column(String(10), nullable=False)
    joined_at = Column(DATETIME, nullable=False)

    user = relationship("User", back_populates="project_members")
    project = relationship("Project", back_populates="project_members")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(100), nullable=False)
    description = Column(TEXT, nullable=True)
    status = Column(String(10), nullable=False)
    priority = Column(String(10), nullable=False)
    due_date = Column(DATETIME, nullable=True)
    created_at = Column(DATETIME, nullable=False)

    user = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")