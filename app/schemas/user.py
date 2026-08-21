from pydantic import BaseModel, ConfigDict

class CreateUser(BaseModel):
    id: int

class UpdateUser(BaseModel):
    name: str

class ResponseUser(BaseModel):
    email: str
    full_name: str

    model_config = ConfigDict(from_attributes=True)