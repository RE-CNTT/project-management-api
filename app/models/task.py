from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base
from datetime import datetime, timezone

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(10), nullable=False)
    priority = Column(String(10), nullable=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default = lambda: datetime.now(timezone.utc).isoformat(), nullable=False)

    user = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")