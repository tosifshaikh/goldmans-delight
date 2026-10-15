from decimal import Decimal
from datetime import datetime
from app.models.base import Base
from sqlalchemy import ForeignKey,Numeric,String,DateTime,Text,func,Index
from sqlalchemy.orm import Mapped,mapped_column
class InventoryCount(Base):
    __tablename__ = 'inventory_counts'
    id : Mapped[int]=mapped_column(primary_key=True,index=True)
    item_id : Mapped[str]=mapped_column(ForeignKey('items.id'),nullable=False,index=True)
    counted_quantity : Mapped[Decimal]=mapped_column(Numeric(16,4),nullable=False)
    system_quantity : Mapped[Decimal]=mapped_column(Numeric(16,4),nullable=False)
    variance: Mapped[Decimal]=mapped_column(Numeric(16,4),nullable=False)
    base_unit_snapshot: Mapped[str]=mapped_column(String(20),nullable=False)
    counted_by : Mapped[int | None]=mapped_column(ForeignKey('users.id',ondelete="set NULL"),nullable=True,index=True)
    notes:Mapped[str]=mapped_column(Text,nullable=True)
    counted_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False,index=True)

    __table_args__ = (
        Index("ix_inventory_counts_item_counted","item_id","counted_at",unique=True),
    )
    def __repr__(self):
        return (f"<InventoryCount item={self.item_id}",f"counted={self.counted_quantity} variance={self.variance}>")