from pydantic import BaseModel, ConfigDict

class CreateTask(BaseModel):
    project_id: int
    title: str
    description: str
    assignee_id: int
    status: str
    priority: str
    due_date: str

class UpdateTask(BaseModel):
    project_id: int
    title: str
    description: str
    assignee_id: int
    status: str
    priority: str
    due_date: str

class ResponseTask(BaseModel):
    project_id: int
    title: str
    description: str
    assignee_id: int
    status: str
    priority: str
    due_date: str

    model_config = ConfigDict(from_attributes=True)