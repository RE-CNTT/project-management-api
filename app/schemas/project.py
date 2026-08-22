from pydantic import BaseModel, ConfigDict

class CreateProject(BaseModel):
    name: str
    description: str
    owner_id: int

class UpdateProject(BaseModel):
    name: str
    description: str
    owner_id: int

class ResponseProject(BaseModel):
    name: str
    description: str

    model_config = ConfigDict(from_attributes=True)