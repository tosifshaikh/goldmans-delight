from datetime import datetime
from pydantic import BaseModel,EmailStr,Field, ConfigDict
from typing import Optional
class UserBase(BaseModel):
    email:EmailStr
    full_name:str=Field(min_length=2,max_length=100)
    role_level_id:int = Field(gt=0)
    is_active:bool=True

class UserCreate(UserBase):
    # password:str = Field(min_length=8,max_length=128) 
    pass

class UserUpdate(BaseModel):
    email: EmailStr | None= None
    full_name:str | None =  Field(min_length=2,max_length=100)
    role_level_id:int |None = Field(default=None, ge=0)
    is_active:int | None = None
    #password: str | None = Field(default=None, min_length=8, max_length=128)

class UserOut(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int
    email:EmailStr
    full_name:str
    role_level_id:int
    is_active:bool
    created_at:datetime
    updated_at:datetime
    generated_password: str | None = None   

""" class UserRead(BaseModel):
    id:int
    email:EmailStr
    full_name:str
    role_level_id :int
    must_change_password:bool
    temp_password: Optional[str] = None    
    model_config = {"from_attributes":True} """