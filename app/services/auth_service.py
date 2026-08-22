from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.schemas.user import CreateUser
from app.core.security import hash_password, verify_password, create_access_token
from app.services.user_service import find_user_by_email
from app.models.user import User

def register(user: CreateUser, db: Session):
    exist_email = find_user_by_email(user.email, db)
    if exist_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email đã tồn tại!")    
    #user.password = hash_password(user.password)

    new_user = User(
        **user.model_dump(exclude={"password"}),
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

def login(email: str, password: str, db: Session):
    exist_email = find_user_by_email(email, db)
    if not exist_email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email hoặc mật khẩu không đúng!")

    if not verify_password(password, exist_email.password_hash):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email hoặc mật khẩu không đúng!")

    return create_access_token(exist_email.id, exist_email.role, 3600)