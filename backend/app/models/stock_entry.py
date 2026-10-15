from decimal import Decimal
from sqlalchemy import ForeignKey,String,Numeric,text,Text,DateTime,func,CheckConstraint,Index
from sqlalchemy.orm import mapped_column,Mapped
from app.models.base import Base

ENTRY_TYPES = ("in", "out", "adjust", "waste", "transfer_in", "transfer_out")
REFERENCE_TYPES = ("manual", "recipe", "production_run", "purchase_order", "count_adjustment", "correction")

class StockEntry(Base):
    __tablename__="stock_entries"
    id:Mapped[int]= mapped_column(primary_key=True,index=True)
    item_id:Mapped[int]=mapped_column(ForeignKey("items.id"),nullable=False,index=True)
    entry_type:Mapped[str]=mapped_column(String(20),nullable=False,index=True)
    quantity:Mapped[Decimal]=mapped_column(Numeric(16,4),nullable=False)
    unit_name:Mapped[str]=mapped_column(String(30),nullable=False)
    unit_factor_snapshot:Mapped[Decimal]=mapped_column(Numeric(18,6),nullable=False)
    base_factor_snapshot:Mapped[str]=mapped_column(String(20),nullable=False)
    quantity_in_base:Mapped[Decimal]=mapped_column(Numeric(16,4),nullable=False)
    cost_per_base_unit_snapshot:Mapped[Decimal | None]=mapped_column(Numeric(14,4),nullable=True)
    total_cost:Mapped[Decimal | None]=mapped_column(Numeric(16,4),nullable=True)
    user_id:Mapped[int | None]=mapped_column(ForeignKey("users.id",ondelete="SET NULL"),nullable=True,index=True)
    reason:Mapped[str | None]= mapped_column(Text,nullable=True)
    reference_type:Mapped[str]=mapped_column(String(30),nullable=False,server_default=text("'mannual'"),index=True)
    reference_id:Mapped[int | None]=mapped_column(nullable=True,index=True)
    reverse_entry_id:Mapped[int | None]=mapped_column(ForeignKey("stock_entries.id"),nullable=True)
    created_at:Mapped["DateTime"]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False,index=True)

    __table_args__= (CheckConstraint(
                    "entry_type IN ('in','out','adjust','waste','transfer_in','transfer_out')",name="ck_stock_entries_entry_type",),
                    CheckConstraint("reference_type IN ('manual','recipe','production_run','purchase_order','count_adjustment','correction')",
            name="ck_stock_entries_reference_type",),
                    CheckConstraint("quantity > 0",name="ck_stock_entries_positive_qty"),
                    Index("ix_stock_entries_item_created","item_id","created_at"),
                    Index("ix_stock_entries_type_created","entry_type","created_at"),)

    def __repr__(self):
        return (f"<StockEntry {self.entry_type} {self.qauntity}{self.unit_name}"
               f"={self.quantity_in_base} base for item={self.item_id}>") 