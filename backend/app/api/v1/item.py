from app.core.database import get_db
from app.schemas.item import ItemOut,ItemCreate,ItemUpdate
from app.schemas.item_unit import ItemUnitCreate,ItemUnitUpdate,ItemUnitOut
from fastapi import APIRouter, Depends, Query, HTTPException,status
from sqlalchemy.orm import Session
from app.models.item import Item
from app.models.item_unit import ItemUnit
from app.crud.item import item as crud_item
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/items", tags=["items"])

@router.get("", response_model=list[ItemOut])
def list_items(
    db:Session=Depends(get_db),
    search:str | None = Query(default=None,description="Case-insensitive name search "),
    item_type:str | None = Query(default=None,description="ingredient | supply | packaging | consumable | other"),
    category:str | None = Query(default=None),
    is_active:bool | None = Query(default=True),
    low_stock:bool | None = Query(default=False),
    skip:int = Query(default=0,ge=0),
    limit:int = Query(default=100,ge=1,le=500),
    ):
    q= db.query(Item)

    if search:
        q=q.filter(Item.name.ilike(f"%{search}%"))
    if item_type:
        q=q.filter(Item.item_type == item_type)
    if category:
        q=q.filter(Item.category == category)
    if is_active is not None:
        q=q.filter(Item.is_active == is_active)
    if low_stock:
        q=q.filter(Item.current_stock <=Item.reorder_level)

    return  q.order_by(Item.name).offset(skip).limit(limit).all()

@router.get("/meta/types",response_model=list[str])
def list_item_types():
    return ["ingredient", "supply", "packaging", "consumable", "other"]

@router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id:int,db:Session=Depends(get_db)):
    obj = crud_item.get(db, item_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Item not found")
    return obj

@router.post("",response_model=ItemOut,status_code=status.HTTP_201_CREATED)
def create_item(payload:ItemCreate,db:Session=Depends(get_db)):
    if crud_item.get_by_name(db, name=payload.name):
        raise HTTPException(status.HTTP_409_CONFLICT,"Item name already exists")
    if payload.sku and crud_item.get_by_sku(db, sku=payload.sku):
        raise HTTPException(status.HTTP_409_CONFLICT,"Sku already exists")

    try:
        return crud_item.create(db,payload)
    except ValueError as e:
        db.rollback()
        raise HTTPException(status.HTTP_400_BAD_REQUEST,str(e))
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Duplicate item or unit name")

@router.patch("/{item_id}", response_model=ItemOut)
def update_item(
        item_id:int,
        payload:ItemUpdate,
        db:Session=Depends(get_db),
        ):
    obj=crud_item.get(db, item_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Item not found")
    if payload.name and payload.name !=obj.name:
        if crud_item.get_by_name(db, name=payload.name):
            raise HTTPException(status.HTTP_409_CONFLICT,"Item name already exists")
    if payload.sku and payload.sku != obj.sku:
        if crud_item.get_by_sku(db, sku=payload.sku):
            raise HTTPException(status.HTTP_409_CONFLICT,"Sku already exists")

    try:
        return crud_item.update(db,obj,payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Update failed - duplicate value")

@router.delete("/{item_id}", response_model=ItemOut)
def deactivate_item(
        item_id:int,
        db:Session=Depends(get_db)):
    obj = crud_item.get(db, item_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Item not found")
    return crud_item.deactivate(db,obj)

@router.get("/{item_id}/units",response_model=list[ItemUnitOut])
def list_item_units(
        item_id:int,
        db:Session=Depends(get_db),
        ):
    obj = crud_item.get(db, item_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Item not found")
    return crud_item.get_units(db,item_id)

@router.post("/{item_id}/units",response_model=ItemUnitOut,status_code=status.HTTP_201_CREATED)
def add_item_unit(
    item_id:int,
    payload:ItemUnitCreate,
    db:Session=Depends(get_db),
    ):
    obj=crud_item.get(db, item_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Item not found")

    existing = (db.query(ItemUnit).filter(ItemUnit.item_id == item_id,ItemUnit.unit_name ==payload.unit_name).first())

    if existing:
        raise  HTTPException(status.HTTP_409_CONFLICT,f"Unit '{payload.unit_name}' already exists for this item")

    unit =  ItemUnit(item_id=item_id,**payload.model_dump())
    db.add(unit)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT,"Duplicate unit name")
    db.refresh(unit)
    return unit

@router.patch("/{item_id}/units/{unit_id}",response_model=ItemUnitOut)
def update_item_unit(
        item_id:int,
        unit_id:int,
        payload:ItemUnitUpdate,
        db:Session=Depends(get_db),
        ):
    obj = crud_item.get(db, item_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Item not found")

    unit = db.query(ItemUnit).filter(
        ItemUnit.id == unit_id,
        ItemUnit.item_id == item_id,
    ).first()
    if not unit:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Unit not found")

    data = payload.model_dump(exclude_unset=True)

    if "unit_name" in data and unit.unit_name == obj.base_unit:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,"The base unit cannot be updated")
    if "factor_to_base" in data and unit.unit_name == obj.base_unit:
        raise  HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "The base unit's conversion factor must remain 1."
        )
    if "unit_name" in data and data["unit_name"] != unit.unit_name:
        dup = (db.query(ItemUnit).filter(
       ItemUnit.item_id == item_id,
                ItemUnit.unit_name == data["unit_name"],
        ).first())

        if dup:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Unit '{data['unit_name']}' already exists for this item",
            )
    for field, value in data.items():
        setattr(unit, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT,"Update failed - duplicate name")
    db.refresh(unit)
    return unit

@router.delete("/{item_id}/units/{unit_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_item_unit(
        item_id:int,
        unit_id:int,
        db:Session=Depends(get_db),
):
    obj = crud_item.get(db, item_id)
    if not obj:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Item not found")

    unit = db.query(ItemUnit).filter(
        ItemUnit.id == unit_id,ItemUnit.item_id == item_id,
    ).first()
    if not unit:
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Unit not found")

    if unit.unit_name == obj.base_unit:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,"Cannot delete base unit.")

    db.delete(unit)
    db.commit()


