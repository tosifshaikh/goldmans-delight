from datetime import datetime
from pydantic import BaseModel,Field,ConfigDict
from decimal import Decimal

class ItemUnitBase(BaseModel):
    unit_name: str = Field(min_length=1,max_length=30)
    factor_to_base: Decimal = Field(gt=0)
    is_purchase: bool = False
    is_consumption: bool = True

class ItemUnitCreate(ItemUnitBase):
    pass
class ItemUnitUpdate(BaseModel):
    unit_name: str | None = Field(default=None,min_length=1, max_length=30)
    factor_to_base: Decimal | None = Field(default=None,gt=0)
    is_purchase: bool | None = None
    is_consumption: bool | None = None

class ItemUnitOut(ItemUnitBase):
    model_config= ConfigDict(from_attributes=True)
    id: int
    item_id:int
    created_at: datetime
    updated_at: datetime