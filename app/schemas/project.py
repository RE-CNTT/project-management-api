from pydantic import BaseModel, ConfigDict

class CreateProject(BaseModel):
    id: int

class UpdateProject(BaseModel):
    name: str

class ResponseProject(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)