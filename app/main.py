from fastapi import FastAPI
from router.exception import router as router_exception
from db.database import Base, engine
from models.user import User
from models.task import Task
from models.project import Project

Base.metadata.create_all(engine)

app = FastAPI()

app.include_router(router=router_exception)