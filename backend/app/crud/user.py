from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate,UserUpdate
from sqlalchemy.orm import Session
from app.core.security import generate_temp_password,hash_password
from app.core.email import send_temp_password_email
class CRUDUser(CRUDBase[User,UserCreate,UserUpdate]):
    def get_by_email(self,db:Session,email:str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def create(self,db:Session,ob_in:UserCreate) ->tuple[User,str | None]:
        data = ob_in.model_dump()
        explicit_password = data.pop("password", None)

        if explicit_password:
            temp_password = explicit_password
            generated = False
        else:
            temp_password = generate_temp_password()
            generated = True

        obj = User(
            **data,
            hashed_password= hash_password(temp_password),
            must_change_password= generated
        )        
        db.add(obj)
        db.commit()
        db.refresh(obj)

        if generated:
            send_temp_password_email(
                to_email=obj.email,
                temp_password=temp_password,
                full_name=getattr(obj,"full_name",None),
            )

        return obj,(temp_password if generated else None)

    def update(self, db:Session, db_obj:User, obj_in:UserUpdate) -> User:
        data = obj_in.model_dump(exclude_unset=True)
        for field,value in data.items():
            setattr(db_obj,field,value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def change_password(self,db:Session,user:User,new_password:str) ->User:
        user.hashed_password = hash_password(new_password)
        user.must_change_password= False
        db.commit()
        db.refesh(user)
        return user

user = CRUDUser(User)    