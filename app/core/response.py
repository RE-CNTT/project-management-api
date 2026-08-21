from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any
from datetime import datetime, timezone

class StandardResponse(BaseModel):
    statusCode: int
    message: str
    data: Any | None = None
    error: Any | None = None
    timestamp: str
    path: str

def standard_response(status_code: int, data: Any, error: Any, message: str, path: str):
    content_response = StandardResponse(
        statusCode=status_code,
        message=message,
        data=data,
        error=error,
        path=path,
        timestamp=datetime.now(timezone.utc).isoformat()
    ).model_dump()

    return JSONResponse(
        status_code=status_code,
        content=content_response
    )