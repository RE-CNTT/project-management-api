from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from core.response import standard_response

router = APIRouter()

@router.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    return standard_response(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, 
        data=None, 
        error=exc.errors(), 
        message="Dữ liệu không hợp lệ!",
        path=request.url.path
    )

@router.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    return standard_response(exc.status_code, None, exc.detail, "Không thành công!", request.url.path)

@router.exception_handler(Exception)
def general_exception_handler():
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"error": "Lỗi máy chủ!"})