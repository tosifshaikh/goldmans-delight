from fastapi import APIRouter,Depends
from app.schemas.role_level import RoleLevelBase,RoleLevelOut
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.crud.role_levels import role_level as crud_role_level

router = APIRouter(prefix="/role_levels",tags=["role_levels"])

@router.get("",response_model=list[RoleLevelOut])
def list_role_levels(
    db:Session=Depends(get_db),
    ):
    return crud_role_level.get_all(db)
