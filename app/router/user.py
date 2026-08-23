from fastapi import APIRouter, Depends
from app.dependencies.dependencies import RoleChecker

router = APIRouter()

allow_admin_only = RoleChecker(["Admin"])

@router.get("/health")
def health_check():
    return {
        "status": "success"
    }

@router.get("/users", dependencies=[Depends(allow_admin_only)])
def get_all_user():
    pass

