from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from decimal import Decimal
from backend.models.models import Order, OrderItem, Product
from backend.schemas.schemas import OrderCreate

def create_checkout_order(db: Session, user_id: UUID, order_data: OrderCreate) -> Order:
    """
    Handles checkout logic within a transaction:
    1. Locks product rows to prevent race conditions.
    2. Verifies stock availability.
    3. Calculates total price.
    4. Creates the order and order items.
    5. Deducts inventory stock.
    6. Commits the transaction.
    """
    # Verify we actually have items in the order
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place an empty order."
        )

    try:
        total_amount = Decimal("0.00")
        items_to_add = []
        
        # 1. Fetch and Lock product rows to prevent concurrent race conditions
        for item in order_data.items:
            # with_for_update locks the rows in PostgreSQL until commit/rollback
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found."
                )
            
            # 2. Verify stock
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. Requested {item.quantity}, available {product.stock}."
                )
                
            # 3. Calculate price and decrement stock
            total_amount += product.price * item.quantity
            product.stock -= item.quantity
            
            # Prepare OrderItem
            order_item = OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price_at_purchase=product.price
            )
            items_to_add.append(order_item)
            
        # 4. Create Order
        new_order = Order(
            user_id=user_id,
            total_amount=total_amount,
            status="Pending"
        )
        db.add(new_order)
        db.flush() # Retrieve new_order.id
        
        # 5. Populate OrderItems with order ID and add to session
        for order_item in items_to_add:
            order_item.order_id = new_order.id
            db.add(order_item)
            
        # 6. Commit transaction
        db.commit()
        db.refresh(new_order)
        return new_order

    except HTTPException:
        # Re-raise standard HTTP exceptions (e.g. stock/not found errors)
        db.rollback()
        raise
    except Exception as e:
        # Catch-all rollback
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Checkout transaction failed: {str(e)}"
        )
