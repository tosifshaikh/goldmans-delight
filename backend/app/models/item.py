from decimal import Decimal
from sqlalchemy import String,text,Numeric,Boolean,Text,CheckConstraint,Index
from sqlalchemy.orm import Mapped,mapped_column,relationship
from app.models.base import Base,TimeStampMixin

ITEM_TYPES = ("ingredients","supply","packaging","consumable","other")

class Item(Base,TimeStampMixin):
    __tablename__="items"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    name:Mapped[str]=mapped_column(String(150),unique=True,index=True,nullable=False)
    sku:Mapped[str | None] = mapped_column(String(50),unique=True,index=True,nullable=True)
    category:Mapped[str | None] = mapped_column(String(80),index=True,nullable=True)
    item_type:Mapped[str] = mapped_column(String(20),nullable=False,index=True,server_default=text("'ingredient'"))
    base_unit:Mapped[str] = mapped_column(String(20),nullable=False)
    base_cost_per_unit:Mapped[Decimal] = mapped_column(Numeric(14,4),nullable=False,default=Decimal("0"),server_default=text("0"))
    current_stock:Mapped[Decimal]=mapped_column(Numeric(16,4),nullable=False,default=Decimal("0"),server_default=text("0"))
    reorder_level:Mapped[Decimal]=mapped_column(Numeric(16,4),nullable=False,default=Decimal("0"),server_default=text("0"))
    is_active:Mapped[bool]=mapped_column(Boolean,nullable=False,default=True,server_default=text("true"),index=True)
    notes:Mapped[str | None] = mapped_column(Text,nullable=True)

    units:Mapped[list["ItemUnit"]] = relationship(back_populates="item")
    __table_args__= (CheckConstraint (
        "item_type IN ('ingredient','supply','packaging','consumable','other')",
        name="ck_items_item_type",
    ),
      Index("ix_items_type_active","item_type","is_active"),
      Index("ix_items_low_stock","current_stock","reorder_level"),
    )

    def __repr__(self) -> str:
        return f"<Item {self.name} [{self.item_type}] ({self.base_unit})>"