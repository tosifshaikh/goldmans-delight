from pydantic import BaseModel,EmailStr,field_validator,Field

class LoginRequest(BaseModel):
    email:EmailStr
    password:str

@field_validator('email',mode="before")
@classmethod
def email_validator(cls,value:str) -> EmailStr:
    return value.strip().lower()  if isinstance(value,str) else value

class TokenResponse(BaseModel):
    access_token:str
    token_type:str="bearer" 

class ChangePasswordRequest(BaseModel):    
    old_password:str
    new_password:str = Field(min_length=8,max_length=128)