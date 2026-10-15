from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.role_level import RoleLevel
from app.schemas.role_level import RoleLevelBase

class CRUDRoleLevel(CRUDBase[RoleLevel,RoleLevelBase,RoleLevelBase]):
    def get_by_key(self,db:Session,key:str) -> RoleLevel | None :
        return db.query(RoleLevel).filter(RoleLevel.key == key).first()

role_level = CRUDRoleLevel(RoleLevel)