from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
from datetime import timedelta, datetime, timezone
from jose import jwt, JWTError, ExpiredSignatureError
from app.core.config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.database import get_db
from app.core.config import settings
from app.services.user_service import find_user_by_id

def hash_password(password: str, cost_factor: int = 12) -> str:
    password_bytes = password.encode()
    salt = bcrypt.gensalt(rounds=cost_factor)

    hashed_password = bcrypt.hashpw(password_bytes, salt)

    return hashed_password.decode()

def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode()
    hashed_bytes = hashed_password.encode()

    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(user_id: int, role: str, expries_detal: timedelta) -> str:
    current_time = datetime.now(timezone.utc)
    expires_time = current_time + expries_detal

    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "role": role,
        "iat":int(current_time.timestamp()),
        "exp": int(expires_time.timestamp())
    }

    return jwt.encode(claims=payload, key=settings.SECRECT_KEY, algorithm=settings.JWT_ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()), db: Session = Depends(get_db)):
    token = credentials.credentials

    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Không thể xác thực thông tin đăng nhập!")

    try:
        payload = jwt.decode(token, settings.SECRECT_KEY, settings.JWT_ALGORITHM)
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Phiên đăng nhập đã hết hạn!")
    except JWTError:
        raise credentials_exception

    user = find_user_by_id(user_id, db)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tìm thấy!")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tài khoản bị khóa!")
    
    return user
