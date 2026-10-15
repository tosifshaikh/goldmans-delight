from app.core.database import SessionLocal
from app.models.role_level import RoleLevel

DEFAULT_ROLE_LEVEL = [
        {"key":"superadmin", "rank": 0, "label" : "Super Admin","description":"Entire application"},
        {"key":"admin", "rank": 100, "label" : "Administrator","description":"System/user administration"},
        {"key":"manager", "rank": 200, "label" : "Manager","description":"Department/operations management"},
        {"key":"supervisor", "rank": 300, "label" : "Supervisor","description":"Team supervision"},
        {"key":"staff", "rank": 400, "label" : "Staff","description":"Day-to-day operations"},
        {"key":"viewer", "rank": 500, "label" : "Viewer","description":"Read-only access"},
]
db = SessionLocal()


for r in DEFAULT_ROLE_LEVEL:
    if not db.query(RoleLevel).filter(RoleLevel.key == r["key"]).first():
        db.add(RoleLevel(**r))
        print(f"+ {r['label']}")
    else:
        print(f"= {r['label']} already exist.")   

db.commit()
db.close()
print("Done.")  