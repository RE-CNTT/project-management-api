from fastapi import APIRouter, status, Depends, Request, Query
from app.schemas.project import CreateProject, UpdateProject, CreateProjectMember
from app.dependencies.dependencies import RoleChecker
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.project import ResponseProject
from app.core.security import get_current_user
from app.services.project_service import (
    create_project_with_owner, 
    get_all_project, 
    get_detail_project_by_member,
    update,
    delete,
    add_member,
    get_all_member,
    delete_member_in_project
)
from app.core.response import standard_response

router = APIRouter(prefix="/api/v1/projects", tags=["CRUD Project"])

allow_admin_user = RoleChecker(["ADMIN", "USER"])

@router.post("", dependencies=[Depends(allow_admin_user)], name="Tạo dự án", status_code=status.HTTP_201_CREATED)
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

@router.get("", dependencies=[Depends(allow_admin_user)], name="Danh sách dự án", status_code=status.HTTP_200_OK)
def get_projects(request: Request, page: int = Query(default=1, min=1), limit: int = Query(default=10, min=1, max=100),name: str|None=None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects, total_page, total_recoder = get_all_project(name, current_user.id, page, limit, db)
    return standard_response(
        status_code=status.HTTP_200_OK,
        data={
            "result": projects,
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

@router.get("/{project_id}", dependencies=[Depends(allow_admin_user)], name="Chi tiết dự án", status_code=status.HTTP_200_OK)
def get_detail(request: Request, project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = get_detail_project_by_member(project_id, current_user.id, db)
    return standard_response(
        status_code=status.HTTP_200_OK,
        data=project,
        error=None,
        message="Thành công!",
        path=request.url.path
    )
@router.put("/{project_id}", dependencies=[Depends(allow_admin_user)], name="Cập nhật dự án", status_code=status.HTTP_200_OK)
def update_project(request: Request, project: UpdateProject, project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = update(project_id, current_user.id, project, db)

    return standard_response(
        status_code=status.HTTP_200_OK,
        data=project,
        error=None,
        message="Cập nhật thành công!",
        path=request.url.path
    )

@router.delete("/{project_id}", name="Xóa dự án", dependencies=[Depends(allow_admin_user)], status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return delete(project_id, current_user.id, db)

@router.post("/{project_id}/members", name="Thêm thành viên", dependencies=[Depends(allow_admin_user)], status_code=status.HTTP_201_CREATED)
def add_member_to_project(request: Request, project_id: int, member: CreateProjectMember, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = add_member(project_id, member, current_user.id, db)

    return standard_response(
           status_code=status.HTTP_201_CREATED,
           data=member,
           error=None,
           message="Thêm thành viên thành công!",
           path=request.url.path
       )

@router.get("/projects/{project_id}/members", name="Danh sách thành viên", dependencies=[Depends(allow_admin_user)], status_code=status.HTTP_200_OK)
def get_members_with_project(request: Request, project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = get_all_member(project_id, current_user.id, db)

    return standard_response(
        status_code=status.HTTP_200_OK,
        data=member,
        error=None,
        message="Lấy danh sách thành viên thành công!",
        path=request.url.path
    )

@router.delete("/{project_id}/members/{user_id}", name="Xóa thành viên", dependencies=[Depends(allow_admin_user)], status_code=status.HTTP_204_NO_CONTENT)
def delete_member(project_id: int, user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return delete_member_in_project(project_id, user_id, current_user.id, db)