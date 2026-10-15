from fastapi import APIRouter,Depends,status,HTTPException
from app.schemas.user import UserOut,UserCreate,UserUpdate
from sqlalchemy.orm import Session
from app.api.deps import get_db,get_current_user
from app.models.user import User
from app.crud.user import user as crud_user
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/users",tags=["users"])

@router.get("",response_model=list[UserOut])
def list_users(
    db:Session=Depends(get_db),
    _:User=Depends(get_current_user),
):
    return crud_user.get_all(db)

@router.post("",response_model=UserOut,status_code=status.HTTP_201_CREATED)
def create_user(
    payload:UserCreate,
    db:Session=Depends(get_db)
    ):
    if crud_user.get_by_email(db,payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT,"Email already registered")
   

    try:
        obj, generated_password = crud_user.create(db, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    out = UserOut.model_validate(obj)
    if generated_password:
        out.generated_password = generated_password
    return out

@router.patch("/{user_id}",response_model=UserOut)
def update_user(user_id:int, payload:UserUpdate, db:Session=Depends(get_db)):
    obj = crud_user.get(db,user_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"user not found")

    return crud_user.update(db, obj, payload)

@router.delete("/{user_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id:int,
    db:Session=Depends(get_db)
):
    obj = crud_user.get(db,user_id)

    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"User not found")

   
    crud_user.delete(db,obj)