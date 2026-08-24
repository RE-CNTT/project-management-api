from pydantic import BaseModel, ConfigDict, Field

class Login(BaseModel):
    email: str
    password: str

class CreateUser(BaseModel):
    email: str = Field(...)
    full_name: str = Field(...)
    password: str = Field(...)
    #role: str = Field(...)
    #is_active: bool = Field(...)

class UpdateUser(BaseModel):
    full_name: str
    role: str
    is_active: bool

class ResponseUser(BaseModel):
    email: str
    full_name: str
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)