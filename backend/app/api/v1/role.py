from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.roles import role as crud_role
from app.models.user import User
from app.schemas.role import RoleCreate,RoleUpdate,RoleOut
from app.api.deps import get_current_user,require_role

router = APIRouter(prefix="/roles",tags=["roles"])

@router.get("",response_model=list[RoleOut])
def list_roles(
        db:Session=Depends(get_db),
        _:User = Depends(get_current_user),
):
    return crud_role.get_all(db)

@router.get("/{role_id}",response_model=RoleOut)
def get_role(
    role_id:int,
    db:Session = Depends(get_db),
    _:User = Depends(get_current_user),
):
    obj = crud_role.get(db,role_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Role not found")
    return obj

@router.post("",response_model=RoleOut,status_code=status.HTTP_201_CREATED)
def create_role(
    payload:RoleCreate,
    db:Session = Depends(get_db),
):
  return crud_role.create(db, payload)

@router.patch("/{role_id}",response_model=RoleOut)
def update_role(role_id:int, payload:RoleUpdate, db:Session=Depends(get_db)):
    obj = crud_role.get(db,role_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Role not found")

    return crud_role.update(db, obj, payload)

@router.delete("/{role_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id:int,
    db:Session=Depends(get_db)
):
    obj = crud_role.get(db,role_id)

    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Role not found")

    if obj.users:
        raise HTTPException(status.HTTP_409_CONFLICT,f"Cannot delete:{len(obj.users)} user(s) have still this role")

    crud_role.delete(db,obj)