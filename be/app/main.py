from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.router.user import router as router_user
from app.router.auth import router as router_auth
from app.router.project import router as router_project
from app.db.database import Base, engine
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.core.response import standard_response

Base.metadata.create_all(engine)

app = FastAPI()

@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    return standard_response(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, 
        data=None, 
        error=exc.errors(), 
        message="Dữ liệu không hợp lệ!",
        path=request.url.path
    )

@app.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    return standard_response(exc.status_code, None, exc.detail, "Không thành công!", request.url.path)

@app.exception_handler(Exception)
def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Lỗi máy chủ!"}
    )

app.include_router(router=router_user)
app.include_router(router=router_auth)
app.include_router(router=router_project)
