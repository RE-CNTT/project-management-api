from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import ResponseUser

def find_user_by_id(user_id: int, db: Session):
    return db.query(User).filter_by(id = user_id).first()

def find_user_by_email(email: str, db: Session):
    return db.query(User).filter_by(email = email).first()

def get_all_user(name:str ,email: str, page: int, limit: int, db: Session):
    total_record = db.query(User).count()

    users = db.query(User)
    if name is not None:
        users = users.filter_by(full_name=name)
    if email is not None:
        users = users.filter_by(email=email)

    users = users.offset((page - 1) * limit).limit(limit).all()
    
    user_data: list[ResponseUser] = []
    for u in users:
        user = ResponseUser(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active
        )
        user_data.append(user)

    return user_data, (total_record + limit - 1) // limit, total_record



