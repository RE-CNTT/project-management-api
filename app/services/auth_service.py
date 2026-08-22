from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.schemas.user import CreateUser
from app.core.security import hash_password
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
