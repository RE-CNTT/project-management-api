from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from app.schemas.user import CreateUser, ResponseUser, Login
from app.db.database import get_db
from app.services.auth_service import register as register_service, login as login_service
from app.core.response import standard_response

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(request: Request, user: CreateUser, db: Session = Depends(get_db)):
    new_user = register_service(user, db)

    user_response = ResponseUser(
        email=new_user.email,
        full_name=new_user.full_name,
        is_active=new_user.is_active,
        role=new_user.role
    )

    return standard_response(
        status_code=status.HTTP_201_CREATED, 
        data=user_response, 
        error=None, 
        message="Đăng ký thành công!", 
        path=request.url.path
    )

@router.post("/login")
def login(request: Request, user: Login, db: Session = Depends(get_db)):
    access_token = login_service(user.email, user.password, db)
    data = {
        "access_token": access_token,
        "type": "Bearer"
    }
    
    return standard_response(
        status_code=status.HTTP_200_OK, 
        data=data, 
        error=None,
        message="Thành công!", 
        path=request.url.path,
    )