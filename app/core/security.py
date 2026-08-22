import bcrypt
from datetime import timedelta, datetime, timezone
import jwt
from app.core.config import settings

def hash_password(password: str, cost_factor: int = 12) -> str:
    password_bytes = password.encode()
    salt = bcrypt.gensalt(rounds=cost_factor)

    hashed_password = bcrypt.hashpw(password_bytes, salt)

    return hashed_password.decode()

def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode()
    hashed_bytes = hashed_password.encode()

    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(user_id: int, role: str, expries_detal: timedelta):
    current_time = datetime.utcnow()
    expires_delta = timedelta(minutes=30)

    expires_time = current_time + expires_delta

    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "role": role,
        "iat":int(current_time.timestamp()),
        "exp": int(expires_time.timestamp())
    }

    return jwt.encode(payload=payload, key=settings.SECRECT_KEY, algorithm=settings.JWT_ALGORITHM)
