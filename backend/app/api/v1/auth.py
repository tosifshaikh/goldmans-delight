from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import TokenResponse, LoginRequest, ChangePasswordRequest
from app.models.user import User
from app.core.security import verify_password,create_access_token,hash_password
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth",tags=["auth"])

@router.post("/login",response_model=TokenResponse)
def login(payload:LoginRequest,db:Session=Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password,user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid email id or password.",)

    if not user.is_active:
        raise HTTPException(status_code=403,detail="Account is disabled.")
    #return TokenResponse(access_token=create_access_token(sub=str(user.id)))

    token = create_access_token(sub=str(user.id))

    if user.must_change_password:
        raise HTTPException(
            status_code=403,
            detail="Password change required",
            headers={"X-Must-Change-Password":"true",
                     "X-Access-Token": token
                     },
        )
    return TokenResponse(access_token=token)

@router.post("/change-password",status_code=200)
def change_password(
    payload:ChangePasswordRequest,
    db:Session=Depends(get_db),
    current_user = Depends(get_current_user),
):
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    if verify_password(payload.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the current one.",
        )

    # 3. Update hash + clear the flag
    current_user.hashed_password = hash_password(payload.new_password)
    current_user.must_change_password = False
    db.commit()
    db.refresh(current_user)

    return {"ok": True, "message": "Password updated successfully."}