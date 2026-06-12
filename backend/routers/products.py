from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from decimal import Decimal
import math

from backend.database.connection import get_db
from backend.models.models import Product
from backend.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from backend.middleware.auth import RoleChecker

router = APIRouter(prefix="/products", tags=["Products"])

# Role checker for admin
require_admin = RoleChecker(allowed_roles=["admin"])

@router.get("", response_model=ProductListResponse)
def get_products(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    featured: Optional[bool] = Query(None),
    sort_by: str = Query("created_at", description="price_asc, price_desc, name_asc, name_desc, created_at"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    # 1. Search Filter
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%") | 
            Product.description.ilike(f"%{search}%")
        )

    # 2. Category Filter
    if category and category.strip() and category != "All":
        query = query.filter(Product.category.ilike(category.strip()))

    # 3. Price Filter
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # 4. Featured Filter
    if featured is not None:
        query = query.filter(Product.featured == featured)

    # 5. Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "name_asc":
        query = query.order_by(Product.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Product.name.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    # 6. Pagination
    total = query.count()
    pages = math.ceil(total / size) if total > 0 else 0
    offset = (page - 1) * size
    items = query.offset(offset).limit(size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate, 
    db: Session = Depends(get_db), 
    admin=Depends(require_admin)
):
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID, 
    product_data: ProductUpdate, 
    db: Session = Depends(get_db), 
    admin=Depends(require_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: UUID, 
    db: Session = Depends(get_db), 
    admin=Depends(require_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    db.delete(product)
    db.commit()
    return {"message": f"Product '{product.name}' deleted successfully"}
