from datetime import datetime

from pydantic import BaseModel,Field,ConfigDict,field_validator
from typing import Literal
from decimal import Decimal
from app.schemas.item_unit import ItemUnitCreate,ItemUnitOut
ItemType = Literal["ingredient", "supply", "packaging", "consumable", "other"]

class ItemBase(BaseModel):
    name: str = Field(min_length=1,max_length=150)
    sku: str | None = Field(default=None,max_length=50)
    category: str | None = Field(default=None,max_length=80)
    item_type: ItemType="ingredient"
    base_unit: str = Field(min_length=1,max_length=20)
    base_cost_per_unit: Decimal = Field(default=Decimal("0"),ge=0)
    current_stock: Decimal = Field(default=Decimal("0"),ge=0)
    reorder_level: Decimal = Field(default=Decimal("0"),ge=0)
    notes: str | None= None

class ItemCreate(ItemBase):
    units: list[ItemUnitCreate] = Field(default_factory=list)

class ItemUpdate(BaseModel):
    name: str | None = Field(default=None,min_length=1, max_length=150)
    sku: str | None = Field(default=None, max_length=50)
    category: str | None = Field(default=None, max_length=80)
    item_type: ItemType | None = None
    base_unit: str | None = Field(default=None,min_length=1, max_length=20)
    base_cost_per_unit: Decimal | None = Field(default=None, ge=0)
    reorder_level: Decimal | None = Field(default=None, ge=0)
    is_active: bool | None = None
    notes: str | None = None

class ItemOut(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id:int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    units: list[ItemUnitOut]= Field(default_factory=list)

@field_validator('units',mode="before")
@classmethod
def sort_units(cls,v):
    if isinstance(v,list):
        raise sorted(v,key=lambda u:(u.factor_to_base,u.unit_name))
        return v
