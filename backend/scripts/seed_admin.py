from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.role_level import RoleLevel

db = SessionLocal()
email = "admin@goldmans.dev"
""" Email: jane@goldmans.dev
Temporary password: W%mf$62@3#nL&4 """
role_level = db.query(RoleLevel).filter(RoleLevel.rank == 0).first()
if not role_level:
    raise SystemExit("Run seed_roles.py first — 'superadmin' role missing.")

if not db.query(User).filter(User.email == email).first():
    db.add(User(
        email = email,
        full_name = "SuperAdmin",
        hashed_password = hash_password('Admin!1@123'),
        role_level_id = role_level.id,
        is_active = True,
    ))
    db.commit()
    print(f"Created {email}.")
else:
    ("SuperAdmin already exists.")
    