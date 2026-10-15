from datetime import datetime,timedelta,timezone
from jose import jwt,JWTError
from passlib.context import CryptContext
from app.core.config import settings
from typing import Any
import string
import secrets

pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")
ALGORITHM = "HS256"
_BCRYPT_MAX_BYTES =  72

def _to_bytes(p:str) -> bytes:
    return p.encode("utf-8")[:_BCRYPT_MAX_BYTES]

def hash_password(password:str) -> str:
    return pwd_context.hash(_to_bytes(password))

def verify_password(plain:str,hashed:str) -> str:
    return pwd_context.verify(_to_bytes(plain),hashed)

def create_access_token(sub:str,extra:dict[str,any] | None= None) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub":sub,
        "iat":int(now.timestamp()),
        "exp":now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }

    if extra:
        payload.update(extra)
    """     
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    """    
    return jwt.encode(payload,settings.SECRET_KEY,algorithm=ALGORITHM)

def decode_token(token:str)-> dict[str,Any]:
    return jwt.decode(token,settings.SECRET_KEY,algorithms=[ALGORITHM])

def generate_temp_password(length:int = 14) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    while True:
        pwd = "".join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in pwd)
            and any(c.isupper() for c in pwd)
            and any(c.isdigit() for c in pwd)
            and any(c in "!@#$%^&*" for c in pwd)
            ):
            return pwd     