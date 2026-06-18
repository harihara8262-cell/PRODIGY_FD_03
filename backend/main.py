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

from backend.database.connection import SessionLocal
from backend.models.models import Product

def seed_database():
    db = SessionLocal()
    try:
        if db.query(Product).count() == 0:
            print("Seeding sample products...")
            sample_products = [
                Product(
                    name="Fresh Organic Bananas (1 Dozen)",
                    description="Sweet and naturally ripened organic bananas, rich in potassium and nutrients.",
                    price=45.00,
                    original_price=60.00,
                    category="Fruits & Vegetables",
                    stock=50,
                    image_url="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400",
                    featured=True
                ),
                Product(
                    name="Farm Fresh Milk (1L)",
                    description="Pasteurized full cream milk sourced from local organic dairy farms.",
                    price=68.00,
                    original_price=75.00,
                    category="Dairy & Eggs",
                    stock=35,
                    image_url="https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400",
                    featured=True
                ),
                Product(
                    name="Whole Wheat Atta Bread (400g)",
                    description="Freshly baked high-fibre whole wheat brown bread, soft and healthy.",
                    price=38.00,
                    original_price=50.00,
                    category="Bakery & Bread",
                    stock=25,
                    image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
                    featured=True
                ),
                Product(
                    name="Organic Tomatoes (1kg)",
                    description="Red, juicy country tomatoes, freshly handpicked from local farms.",
                    price=35.00,
                    original_price=70.00,
                    category="Fruits & Vegetables",
                    stock=60,
                    image_url="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400",
                    featured=True
                ),
                Product(
                    name="Amul Salted Butter (100g)",
                    description="Classic Indian salted butter, delicious spread for toast and baking.",
                    price=56.00,
                    original_price=62.00,
                    category="Dairy & Eggs",
                    stock=40,
                    image_url="https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400",
                    featured=False
                ),
                Product(
                    name="Alphonso Mangoes (1kg)",
                    description="Premium export-quality sweet Alphonso mangoes, directly from Ratnagiri farms.",
                    price=280.00,
                    original_price=350.00,
                    category="Fruits & Vegetables",
                    stock=15,
                    image_url="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400",
                    featured=True
                ),
                Product(
                    name="Fresh Paneer / Cottage Cheese (200g)",
                    description="Soft and fresh block paneer, rich in protein, perfect for curries.",
                    price=85.00,
                    original_price=95.00,
                    category="Dairy & Eggs",
                    stock=20,
                    image_url="https://images.unsplash.com/photo-1628294895520-73f08b2c5661?auto=format&fit=crop&q=80&w=400",
                    featured=False
                ),
                Product(
                    name="Premium Multi-Grain Rusk (300g)",
                    description="Double baked crispy multi-grain tea rusks, perfect with morning chai.",
                    price=48.00,
                    original_price=60.00,
                    category="Bakery & Bread",
                    stock=30,
                    image_url="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=400",
                    featured=False
                )
            ]
            db.add_all(sample_products)
            db.commit()
            print("Successfully seeded sample products in Rupees with discounts!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

seed_database()

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
