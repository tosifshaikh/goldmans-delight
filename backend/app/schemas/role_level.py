from pydantic import BaseModel,Field,ConfigDict
from datetime import datetime

class RoleLevelBase(BaseModel):
    key:str=Field(min_length=2,max_length=50)
    rank:int=Field(ge=0,le=10000)
    label:str=Field(min_length=2,max_length=100)
    description:str | None = Field(min_length=2,max_length=255,default=None)

class RoleLevelOut(RoleLevelBase):
    model_config=ConfigDict(from_attributes=True)
    id:int
    created_at:datetime
    updated_at:datetime   