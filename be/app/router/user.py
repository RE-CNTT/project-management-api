from fastapi import APIRouter, Depends, status, Request, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.dependencies.dependencies import RoleChecker
from app.models.user import User
from app.core.security import get_current_user
from app.core.response import standard_response
from app.schemas.user import ResponseUser
from app.services.user_service import get_all_user

router = APIRouter(prefix="/api/v1", tags=["Info"])

allow_admin_only = RoleChecker(["ADMIN"])
allow_admin_user = RoleChecker(["ADMIN", "USER"])

@router.get("/health")
def health_check():
    return {
        "status": "success"
    }

@router.get("/me",name="Thông người dùng", dependencies=[Depends(allow_admin_user)])
def get_me(request: Request, current_user: User = Depends(get_current_user)):
    user = ResponseUser(
        id=current_user.id,
        email= current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        role=current_user.role
    )

    return standard_response(
        status_code=status.HTTP_200_OK,
        data=user,
        error=None,
        message="Thành công!",
        path=request.url.path
    )

@router.get("/users",name="Danh sách người dùng", dependencies=[Depends(allow_admin_only)], status_code=status.HTTP_200_OK)
def get_user(request: Request, page: int = Query(default=1, min=1), limit: int = Query(default=10, min=1, max=100), name: str | None = None, email: str|None= None, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    users, total_page, total_recoder = get_all_user(name, email, page, limit, db)
    return standard_response(
        status_code=status.HTTP_200_OK, 
        data= {
            "result":users,
            "metadata": {
                "page": page,
                "limit": limit,
                "total_page": total_page,
                "total_recoder": total_recoder
            }
        },
        error=None, 
        message="Thành công!", 
        path=request.url.path
    )