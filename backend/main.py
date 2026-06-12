import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import connection & models to create tables
from backend.database.connection import engine, Base
from backend.models import models
from backend.routers import products, orders, profile, admin

load_dotenv()

# Create tables in Database (automatically runs on local SQLite or PostgreSQL if connected)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Local E-Commerce API",
    description="Production-Ready Local E-Commerce Web Application API",
    version="1.0.0"
)

# CORS Middleware config
# In development, Vite frontend runs on port 5173
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "app": "Local E-Commerce API",
        "status": "online",
        "database": str(engine.url.drivername)
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
