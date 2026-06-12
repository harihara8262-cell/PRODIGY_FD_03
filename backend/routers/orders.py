from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from backend.database.connection import get_db
from backend.models.models import Order, Profile
from backend.schemas.schemas import OrderCreate, OrderResponse
from backend.middleware.auth import get_current_user, RoleChecker
from backend.services.inventory import create_checkout_order

router = APIRouter(prefix="/orders", tags=["Orders"])

# Role checker for admin
require_admin = RoleChecker(allowed_roles=["admin"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_data: OrderCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Delegate order creation to the transactional inventory/checkout service
    return create_checkout_order(db=db, user_id=current_user.id, order_data=order_data)

@router.get("", response_model=List[OrderResponse])
def get_orders(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Admin is allowed to view all orders; customers are restricted to their own
    if current_user.role == "admin":
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    else:
        orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: UUID,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Check permissions: must be the owner of the order or an admin
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this order."
        )
        
    return order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: UUID,
    status_val: str = Query(..., alias="status", description="Pending, Confirmed, Packed, Shipped, Out For Delivery, Delivered, Cancelled"),
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    allowed_statuses = ["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"]
    if status_val not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid order status. Allowed states: {allowed_statuses}"
        )
        
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    order.status = status_val
    db.commit()
    db.refresh(order)
    return order
