from fastapi import APIRouter, Depends, status, Request
from app.dependencies.dependencies import RoleChecker
from app.models.user import User
from app.core.security import get_current_user
from app.core.response import standard_response
from app.schemas.user import ResponseUser

router = APIRouter(prefix="/api/v1")

allow_admin_only = RoleChecker(["ADMIN"])
allow_admin_user = RoleChecker(["ADMIN", "USER"])

@router.get("/health")
def health_check():
    return {
        "status": "success"
    }

@router.get("/me", dependencies=[Depends(allow_admin_user)])
def get_me(request: Request, current_user: User = Depends(get_current_user)):
    user = ResponseUser(
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