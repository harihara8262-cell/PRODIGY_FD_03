from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from decimal import Decimal

from backend.database.connection import get_db
from backend.models.models import Order, OrderItem, Product, Profile
from backend.middleware.auth import RoleChecker

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

# Require admin privileges
require_admin = RoleChecker(allowed_roles=["admin"])

@router.get("/dashboard-stats", dependencies=[Depends(require_admin)])
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Retrieves aggregated business statistics for the admin dashboard.
    """
    # 1. Card Stats
    # Total Orders Count
    orders_count = db.query(Order).count()
    
    # Total Products Count
    products_count = db.query(Product).count()
    
    # Total Customer Accounts
    customers_count = db.query(Profile).filter(Profile.role == "customer").count()
    
    # Total Sales (Sum of ALL order totals)
    total_sales_q = db.query(func.sum(Order.total_amount)).first()
    total_sales = Decimal(str(total_sales_q[0])) if total_sales_q[0] is not None else Decimal("0.00")
    
    # Net Revenue (Sum of all orders NOT cancelled)
    revenue_q = db.query(func.sum(Order.total_amount)).filter(Order.status != "Cancelled").first()
    revenue = Decimal(str(revenue_q[0])) if revenue_q[0] is not None else Decimal("0.00")

    # 2. Sales Overview (Sales trend for the last 7 days)
    sales_overview = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        
        day_sales_q = db.query(func.sum(Order.total_amount))\
            .filter(Order.created_at >= day_start, Order.created_at <= day_end, Order.status != "Cancelled")\
            .first()
        day_sales = Decimal(str(day_sales_q[0])) if day_sales_q[0] is not None else Decimal("0.00")
        
        sales_overview.append({
            "date": day.strftime("%b %d"),
            "sales": float(day_sales)
        })

    # 3. Top Products (By Quantity Sold)
    top_products_q = db.query(
        Product.name,
        func.sum(OrderItem.quantity).label("quantity_sold"),
        func.sum(OrderItem.quantity * OrderItem.price_at_purchase).label("product_revenue")
    ).join(OrderItem, Product.id == OrderItem.product_id)\
     .join(Order, OrderItem.order_id == Order.id)\
     .filter(Order.status != "Cancelled")\
     .group_by(Product.name)\
     .order_by(desc("quantity_sold"))\
     .limit(5)\
     .all()
     
    top_products = [
        {
            "name": row[0],
            "quantity": int(row[1]) if row[1] is not None else 0,
            "revenue": float(row[2]) if row[2] is not None else 0.0
        } for row in top_products_q
    ]

    # 4. Recent Orders
    recent_orders_q = db.query(
        Order.id,
        Order.total_amount,
        Order.status,
        Order.created_at,
        Profile.full_name.label("customer_name"),
        Profile.email.label("customer_email")
    ).join(Profile, Order.user_id == Profile.id)\
     .order_by(Order.created_at.desc())\
     .limit(5)\
     .all()
     
    recent_orders = [
        {
            "id": row.id,
            "total_amount": float(row.total_amount),
            "status": row.status,
            "created_at": row.created_at.isoformat(),
            "customer_name": row.customer_name or "Anonymous User",
            "customer_email": row.customer_email
        } for row in recent_orders_q
    ]

    # 5. Inventory Status (Products with low stock)
    low_stock_q = db.query(Product)\
        .order_by(Product.stock.asc())\
        .limit(5)\
        .all()
        
    low_stock = [
        {
            "id": p.id,
            "name": p.name,
            "stock": p.stock,
            "category": p.category,
            "price": float(p.price)
        } for p in low_stock_q
    ]

    return {
        "cards": {
            "totalSales": float(total_sales),
            "revenue": float(revenue),
            "ordersCount": orders_count,
            "productsCount": products_count,
            "customersCount": customers_count
        },
        "salesOverview": sales_overview,
        "topProducts": top_products,
        "recentOrders": recent_orders,
        "lowStockProducts": low_stock
    }
