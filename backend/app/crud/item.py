from decimal import Decimal
from app.crud.base import CRUDBase
from app.models import Item
from app.models.item_unit import ItemUnit
from app.schemas.item import ItemCreate, ItemUpdate
from app.schemas.item_unit import ItemUnitCreate
from  sqlalchemy.orm import Session
from sqlalchemy import select

class CRUDItem(CRUDBase[Item,ItemCreate,ItemUpdate]):
    def get_by_name(self,db:Session,name:str) ->Item | None:
        stmt = select(Item).where(Item.name == name)
        return db.scalars(stmt).first()

    def get_by_sku(self,db:Session,sku:str) -> Item | None:
        stmt = select(Item).where(Item.sku == sku)
        return db.scalars(stmt).first()

    def create(self,db:Session,obj_in:ItemCreate) -> Item:
        data = obj_in.model_dump(exclude={"units"})
        db_item = Item(**data)
        db.add(db_item)
        db.flush()

        base = ItemUnit(
            item_id=db_item.id,
            unit_name=db_item.base_unit,
            factor_to_base = Decimal("1"),
            is_purchase = False,
            is_consumption = True,
        )
        db.add(base)
        seen:set[str] = {base.unit_name}
        for u in obj_in.units:
            if u.unit_name in seen:
                raise ValueError(f"Duplicate unit name: {u.unit_name}")
            seen.add(u.unit_name)
            db.add(ItemUnit(item_id=db_item.id,**u.model_dump()))

        db.commit()
        db.refresh(db_item)
        return db_item

    def update(self,db:Session,db_obj:Item,obj_in:ItemUpdate) -> Item:
        data = obj_in.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(db_obj, field, value)
        db_obj.commit()
        db.refresh(db_obj)
        return db_obj

    def deactivate(self,db:Session,db_obj:Item) -> Item:
        if db_obj.is_active:
            db_obj.is_active = False
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def get_units(self,db:Session,item_id:int) -> list[ItemUnit]:
        return list(db.scalars(
            select(ItemUnit)
            .where(ItemUnit.item_id == item_id)
            .order_by(ItemUnit.factor_to_base,ItemUnit.unit_name)
          )
        )

item = CRUDItem(Item)
