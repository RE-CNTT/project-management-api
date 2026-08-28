from pydantic import BaseModel, ConfigDict
from app.schemas.user import User

class CreateProject(BaseModel):
    name: str
    description: str

class CreateProjectMember(BaseModel):
    user_id: int

class UpdateProject(BaseModel):
    name: str
    description: str
    owner_id: int 

class ResponseProject(BaseModel):
    id: int
    name: str
    description: str
    
    model_config = ConfigDict(from_attributes=True)

class ResponseProjectDetail(BaseModel):
    id: int
    name: str
    description: str
    owner: User
    
    model_config = ConfigDict(from_attributes=True)

class MembersProject(User):
    role: str