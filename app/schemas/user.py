from pydantic import BaseModel, ConfigDict

class CreateUser(BaseModel):
    email: str
    full_name: str
    role: str
    is_active: bool

class UpdateUser(BaseModel):
    full_name: str
    role: str
    is_active: bool

class ResponseUser(BaseModel):
    full_name: str
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)