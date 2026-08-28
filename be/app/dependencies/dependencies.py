from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.core.security import get_current_user

class RoleChecker:
    def __init__(self, allow_roles: list[str]):
        self.allow_roles = allow_roles

    def __call__(self, current_user:User = Depends(get_current_user)):
        if current_user.role not in self.allow_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không có quyền truy cập!")
        return current_user