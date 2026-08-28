from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.project import (
    CreateProject, 
    ResponseProject, 
    ResponseProjectDetail, 
    UpdateProject, 
    CreateProjectMember,
    ProjectMember
)
from app.models.project import Project, ProjectMember
from app.schemas.user import User
from app.services.user_service import find_user_by_id

def find_project_by_id(project_id: int, db: Session) -> Project:
    project = db.query(Project).filter_by(id=project_id).first()
    if project is None:
        return None
    return project

def create_project_with_owner(project: CreateProject, user_id: int, db: Session):
    new_project = Project(
        owner_id = user_id,
        **project.model_dump()
    )

    try:
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
    except:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Thêm project thất bại!")

    return new_project

def get_all_project(name: str, user_id: int, db: Session) -> list[ResponseProject]:
    list_projects = []
    projects = db.query(Project).filter_by(owner_id=user_id)
    if name is not None:
        projects = projects.filter_by(name=name)

    projects.all()

    for project in projects:
        resp_pj = ResponseProject(
            id=project.id,
            name=project.name,
            description=project.description
        )
        list_projects.append(resp_pj)

    return list_projects

def get_detail_project_by_member(project_id: int, user_id: int, db: Session) -> ResponseProjectDetail:
    project_detail = db.query(Project).filter_by(id=project_id).first()
    if project_detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project không tồn tại!")

    if project_detail.owner_id == user_id:
        return ResponseProjectDetail(
            id=project_detail.id,
            name=project_detail.name,
            description=project_detail.description,
            owner=User(
                email=project_detail.owner.email,
                full_name=project_detail.owner.full_name
            )
        )

    for project_member in project_detail.project_members:

        if project_member.user_id == user_id:
            return ResponseProjectDetail(
                id=project_detail.id,
                name=project_detail.name,
                description=project_detail.description,
                owner=User(
                    email=project_detail.owner.email,
                    full_name=project_detail.owner.full_name
                )
            )
        
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xem projet này!")
        
def update(project_id: int, user_id: int, project_update: UpdateProject, db: Session) -> ResponseProject:
    project = find_project_by_id(project_id, db)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project không tồn tại!")

    if project.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không có quyền truy cập!")

    if project_update.owner_id != 0:
        user = find_user_by_id(project_update.owner_id, db)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tồn tại!")
        
        project.owner_id = project_update.owner_id

    project.name = project_update.name
    project.description = project_update.description
    project.owner_id = user_id

    db.commit()
    db.refresh(project)

    return ResponseProject(
        id=project.id,
        name=project.name,
        description=project.description
    )

def delete(project_id: int, user_id: int, db: Session):
    project = find_project_by_id(project_id, db)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project không tồn tại!")
    if project.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không có quyền truy cập!")

    db.delete(project)
    db.commit()

    return None

def add_member(project_id: int, member: CreateProjectMember, user_id: int, db: Session):
    project = find_project_by_id(project_id, db)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project không tồn tại!")
    if project.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không có quyền truy cập!")

    if project.owner_id == member.user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Thành viên đã là chủ dự án!")
    
    user = find_user_by_id(member.user_id, db)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tồn tại!")

    exists_member = db.query(ProjectMember).filter_by(project_id=project_id, user_id=member.user_id).first()
    if exists_member is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Thành viên này đã có trong dự án!")

    db.add(ProjectMember(
        project_id=project_id,
        user_id=member.user_id,
        role="MEMBER"
    ))

    db.commit()

    return None

def get_all_member(project_id:int, user_id: int, db: Session):
    project = find_project_by_id(project_id, db)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project không tồn tại!")

    is_member = db.query(ProjectMember).filter_by(project_id=project_id, user_id=user_id).first()
    if is_member is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không có quyền truy cập")

    members = db.query(ProjectMember).filter_by(project_id=project_id, user_id=user_id).all()

    list_members: list[ProjectMember] = []

    for m in members:
        member = ProjectMember(
            email=m.user.email,
            full_name=m.user.full_name,
            role=m.role
        )

        list_members = list_members.append(member)

    print(list_members)