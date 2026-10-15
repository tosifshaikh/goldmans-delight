from app.models.base import Base,TimeStampMixin
from sqlalchemy.orm import Mapped,mapped_column,relationship
from sqlalchemy import String,Integer,CheckConstraint,Index
class RoleLevel(Base,TimeStampMixin):
    __tablename__="role_levels"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    key:Mapped[str]=mapped_column(String(50),unique=True,index=True,nullable=False)
    rank:Mapped[int]=mapped_column(Integer,nullable=False)
    label:Mapped[str]=mapped_column(String(100),nullable=False)
    description:Mapped[str | None] = mapped_column(String(255),nullable=True)
    #role_level must be same attribute in users
    users:Mapped[list["User"]] = relationship(back_populates="role_level")

    __table_args__=(CheckConstraint("rank >=0 AND rank<=10000",name="ck_role_levels_range_rank"),
                    Index("uq_role_levels_rank","rank",unique=True)
                    )