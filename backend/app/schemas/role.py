from datetime import datetime
from pydantic import BaseModel,Field,ConfigDict

class RoleBase(BaseModel):
    name:str = Field(min_length=2,max_length=50)
    description:str | None = Field(default=None,max_length=255)
    level:int = Field(default=1,le=100)

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name:str | None = Field(default=None,min_length=2,max_length=50)
    description:str | None = Field(default=None,max_length=255)
    level:int = Field(default=1,le=100)

class RoleOut(BaseModel):
    model_config=ConfigDict(from_attributes=True)

    id:int
    name: str
    description: str | None
    level: int
    created_at:datetime
    updated_at:datetime