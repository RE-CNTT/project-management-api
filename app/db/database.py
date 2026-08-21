from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine
from core.config import settings

class Base(DeclarativeBase): pass

engine = create_engine(settings.DB_URL, pool_size=10)

SessionLocal = sessionmaker(engine, autoflush=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()