from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.role import Role
from app.schemas.role import RoleCreate,RoleUpdate

class CRUDRole(CRUDBase[Role,RoleCreate,RoleUpdate]):
    def get_by_name(self,db:Session,name:str) -> Role | None:
        return db.query(Role).filter(Role.name == name).first()

role = CRUDRole(Role)    
