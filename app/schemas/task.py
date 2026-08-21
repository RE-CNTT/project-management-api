from pydantic import BaseModel, ConfigDict

class CreateTask(BaseModel):
    id: int

class UpdateTask(BaseModel):
    name: str

class ResponseTask(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)