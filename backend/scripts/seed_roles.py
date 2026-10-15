from app.core.database import SessionLocal
from app.models.role import Role

DEFAULT_ROLES = [
    {"name":"SuperAdmin", "description": "Full access to everything", "level" : 0},
]

db = SessionLocal()

for r in DEFAULT_ROLES:
    if not db.query(Role).filter(Role.level == r["level"]).first():
        db.add(Role(**r))
        print(f"+ {r['name']}")
    else:
        print(f"= {r['name']} already exist.")   

db.commit()
db.close()
print("Done.")        