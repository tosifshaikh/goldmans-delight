from typing import Any,Generic,TypeVar,Type
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.base import Base

ModelT = TypeVar("ModelT",bound=Base)
CreateT = TypeVar("CreateT",bound=BaseModel)
UpdateT = TypeVar("UpdateT",bound=BaseModel)

class CRUDBase(Generic[ModelT,CreateT,UpdateT]):
    def __init__(self,model:Type[ModelT]):
        self.model= model

    def get(self,db:Session,id:int) -> ModelT | None:
        return db.get(self.model,id)

    def get_all(self,db:Session,skip:int=0,limit:int=100) ->list[ModelT]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self,db:Session,ob_in:CreateT) -> ModelT:
       obj = self.model(**ob_in.model_dump())
       db.add(obj)
       db.commit()
       db.refresh(obj)
       return obj

    def update(self,db:Session,db_obj:ModelT,obj_in:UpdateT) ->ModelT:
        for field, value in obj_in.model_dump(exclude_unset=True).items():
            setattr(db_obj,field,value)
        db.commit()
        db.refresh(db_obj)  
        return db_obj  

    def delete(self,db:Session,db_obj:ModelT) -> None:
        db.delete(db_obj)
        db.commit()
