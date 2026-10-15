from sqlalchemy import Integer,ForeignKey,String,Numeric,Boolean,text,UniqueConstraint,Index
from decimal import Decimal
from sqlalchemy.orm import Mapped,mapped_column,relationship
from app.models.base import Base,TimeStampMixin
class ItemUnit(Base,TimeStampMixin):
    __tablename__="item_units"
    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    item_id:Mapped[int]=mapped_column(ForeignKey("items.id"),nullable=True,index=True)
    unit_name:Mapped[str]=mapped_column(String(30),nullable=False)
    factor_to_base:Mapped[Decimal]=mapped_column(Numeric(18,6),nullable=False)
    is_purchase:Mapped[bool]=mapped_column(Boolean,nullable=True,default=False,server_default=text("false"))
    is_consumption:Mapped[bool]=mapped_column(Boolean,nullable=False,default=True,server_default=text("true"))
    item:Mapped["Item"]=relationship(back_populates="units")

    __table_args__= (UniqueConstraint("item_id","unit_name",name="uq_item_units_item_name"),
                     Index("ix_item_units_item","item_id"),
                     )

    def __repr__(self) -> str:
        return f"<ItemUnit {self.unit_name} = {self.factor_to_base} base>"