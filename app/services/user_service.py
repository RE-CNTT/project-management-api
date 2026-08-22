from sqlalchemy.orm import Session
from app.models.user import User

def find_user_by_email(email: str, db: Session):
    return db.query(User).filter_by(email = email).first()



