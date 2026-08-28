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

class User(BaseModel):
    email: str
    full_name: str

class ResponseUser(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class PaginatedUserResponse(BaseModel):
    total_record: int = Field(..., example=100)
    total_page: int = Field(..., example=10)
    page: int = Field(..., example=1)
    limit: int = Field(..., example=10)
    result: list[ResponseUser]