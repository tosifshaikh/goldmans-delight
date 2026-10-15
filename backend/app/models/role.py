from sqlalchemy import String,SmallInteger,CheckConstraint,Index,Integer,text
from sqlalchemy.orm import Mapped,mapped_column,relationship
from app.models.base import Base,TimeStampMixin

class Role(Base,TimeStampMixin):
    __tablename__ ="roles"

    id:Mapped[int] = mapped_column(primary_key=True,index=True)
    name:Mapped[str] = mapped_column(String(50),unique=True,index=True,nullable=False)
    description:Mapped[str | None] = mapped_column(String(255),nullable=True)
    level:Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=100,              # Python-side default (weakest)
        server_default=text("100"),  # DB-side default (weakest)                   
)
#    users:Mapped[list["User"]] = relationship(back_populates="role")

    __table_args__ = (
        CheckConstraint("level >=0 AND level <=100000",name="ck_roles_level_range"),
        Index("uq_roles_level", "level", unique=True),
        Index(
            "uq_roles_superadmin",
            "level",
            unique=True,
            postgresql_where=text("level = 0"),
        ),
    )
"""     users:Mapped[list["User"]] = relationship(back_populates="role",cascade="all,delete-orphan")
 """

def __repr__(self) -> str:
    return f"<Role {self.name} (level={self.level})>"

""" if user.role.is_at_least(300):        # editor or stronger
    allow_edit()

if user.role.is_superadmin:           # only level 0
    allow_dangerous_action() """
def is_at_least(self,required_level:int) ->bool:
    return self.level <=required_level

@property
def is_superadmin(self):
    return self.level == 0

