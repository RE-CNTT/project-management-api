import bcrypt

def hash_password(password: str, cost_factor: int = 12) -> str:
    password_bytes = password.encode()
    salt = bcrypt.gensalt(rounds=cost_factor)

    hashed_password = bcrypt.hashpw(password_bytes, salt)

    return hashed_password.decode()

def verify_password(password, hashed_password: str) -> bool:
    pass