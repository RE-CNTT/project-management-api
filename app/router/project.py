from fastapi import APIRouter, status, Depends, Request
from app.schemas.project import CreateProject
from app.dependencies.dependencies import RoleChecker
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.project import ResponseProject
from app.core.security import get_current_user
from app.services.project_service import (
    create_project_with_owner, 
    get_all_project, 
    get_detail_project_by_member
)
from app.core.response import standard_response

router = APIRouter(prefix="/api/v1/projects")

allow_admin_user = RoleChecker(["ADMIN", "USER"])

@router.post("", dependencies=[Depends(allow_admin_user)], status_code=status.HTTP_201_CREATED)
def create_project(request: Request, project: CreateProject, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = create_project_with_owner(project, current_user.id, db) 
    new_project = ResponseProject(
        name=project.name,
        description=project.description
    )

    return standard_response(
        status_code=status.HTTP_201_CREATED, 
        data=new_project, 
        error=None, 
        message="Thành công!", 
        path=request.url.path
    )

@router.get("", dependencies=[Depends(allow_admin_user)], status_code=status.HTTP_200_OK)
def get_projects(request: Request, name: str|None=None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = get_all_project(name, current_user.id, db)

    return standard_response(
        status_code=status.HTTP_200_OK,
        data=projects,
        error=None,
        message="Thành công!",
        path=request.url.path
    )

@router.get("/{project_id}", dependencies=[Depends(allow_admin_user)], status_code=status.HTTP_200_OK)
def get_detail(request: Request, project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = get_detail_project_by_member(project_id, current_user.id, db)
    return standard_response(
        status_code=status.HTTP_200_OK,
        data=project,
        error=None,
        message="Thành công!",
        path=request.url.path
    )