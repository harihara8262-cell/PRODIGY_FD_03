from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

# Profile Schemas
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ProfileCreate(ProfileBase):
    id: UUID
    email: EmailStr
    role: str = "customer"

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: str
    role: str
    created_at: datetime

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    original_price: Optional[Decimal] = None
    category: str
    stock: int = 0
    image_url: Optional[str] = None
    featured: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    featured: Optional[bool] = None

class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    size: int
    pages: int

# Order Item Schemas
class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    order_id: UUID
    product_id: Optional[UUID] = None
    quantity: int
    price_at_purchase: Decimal
    product: Optional[ProductResponse] = None

# Order Schemas
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

# Admin Dashboard Stats
class AdminStatsResponse(BaseModel):
    total_sales: Decimal
    revenue: Decimal
    orders_count: int
    products_count: int
    customers_count: int
