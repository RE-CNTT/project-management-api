from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.project import CreateProject, ResponseProject
from app.models.project import Project, ProjectMember
from app.schemas.user import User

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
    if name is None:
        projects = projects.filter_by(name=name)

    projects.all()

    for project in projects:
        resp_pj = ResponseProject(
            name=project.name,
            description=project.description
        )
        list_projects.append(resp_pj)

    return list_projects

def get_detail_project_by_member(project_id: int, user_id: int, db: Session) -> ResponseProject:
    project_detail = db.query(Project).filter_by(id=project_id).first()
    if project_detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project không tồn tại!")

    if project_detail.owner_id == user_id:
        return ResponseProject(
            name=project_detail.name,
            description=project_detail.description,
            owner=User(
                email=project_detail.owner.email,
                full_name=project_detail.owner.full_name
            )
        )

    for project_member in project_detail.project_members:

        if project_member.user_id == user_id:
            return ResponseProject(
                name=project_detail.name,
                description=project_detail.description,
                owner=User(
                    email=project_detail.owner.email,
                    full_name=project_detail.owner.full_name
                )
            )
        
    
        
