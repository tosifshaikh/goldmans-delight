from fastapi import Depends,HTTPException,status
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from jose import jwt,JWTError
from sqlalchemy.orm import Session,joinedload
from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(
        cred:HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
        db:Session =Depends(get_db),
) -> User:
    if cred is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Not authenticated")

    try:
        payload = decode_token(cred.credentials)
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Invalid token")

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Invalid token payload")

   # user = db.get(User,int(user_id))
    user = (
        db.query(User)
        .options(joinedload(User.role_level))
        .filter(User.id == int(user_id))
        .first()
    )

    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,"User not found or inactive")

    return user

def require_role(*allowed:str):
    def checker(current_user:User=Depends(get_current_user)) -> User:
        if current_user.role_level.level not in allowed:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"Requires role:{', '.join(allowed)}",
            )
        return current_user
    return checker

def _level_of(user:User)->int:
    if user.role is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User has no role assigned"
        )
    return user.role.level

def require_min_level(min_level:int):
    def _checker(user:User=Depends(get_current_user)) -> User:
        if user.role.level > min_level:
            raise HTTPException(403,"Insufficient privileges")
        return user
    return _checker

def require_exact_level(*levels:int):
    def checker(user: User = Depends(get_current_user)) -> User:
        if _level_of(user) not in levels:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires level in {levels}",
            )
        return user
    return checker

