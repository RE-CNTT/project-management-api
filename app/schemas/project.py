from pydantic import BaseModel, ConfigDict
from app.schemas.user import User

class CreateProject(BaseModel):
    name: str
    description: str

class UpdateProject(BaseModel):
    name: str
    description: str
    owner_id: int

class ResponseProject(BaseModel):
    name: str
    description: str
    owner: User
    
    model_config = ConfigDict(from_attributes=True)