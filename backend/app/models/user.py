from sqlalchemy import Boolean,String,ForeignKey,text
from sqlalchemy.orm import mapped_column,Mapped,relationship
from app.models.base import Base,TimeStampMixin

class User(Base,TimeStampMixin):
    __tablename__="users"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    email:Mapped[str] = mapped_column(String(255),unique=True,index=True,nullable=False)
    full_name:Mapped[str]=mapped_column(String(255),nullable=False)
    hashed_password : Mapped[str]= mapped_column(String(255),nullable=False)
    role_level_id : Mapped[int] = mapped_column(ForeignKey("role_levels.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    must_change_password:Mapped[bool] = mapped_column(Boolean,nullable=False,default=False, server_default=text("false"))
    role_level: Mapped["RoleLevel"] = relationship(back_populates="users", lazy="joined")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

def __repr__(self)->str:
    return f"<User {self.email}>"