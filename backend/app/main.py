from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth,role,user,role_level,item
app = FastAPI(title="Goldman's Delight API",version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router,prefix="/api/v1")
app.include_router(role.router,prefix="/api/v1")
app.include_router(user.router,prefix="/api/v1")
app.include_router(role_level.router,prefix="/api/v1")
app.include_router(item.router,prefix="/api/v1")