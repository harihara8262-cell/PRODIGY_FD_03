import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from uuid import UUID
from backend.database.connection import get_db
from backend.models.models import Profile

security = HTTPBearer()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def get_current_user_payload(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        # Check if the secret is set and is not the placeholder
        if not SUPABASE_JWT_SECRET or SUPABASE_JWT_SECRET == "your_supabase_jwt_secret_here" or SUPABASE_JWT_SECRET == "mock":
            # For local development / quick testing, decode without signature verification if secret is not set
            payload = jwt.decode(token, "", options={"verify_signature": False})
        else:
            # Decode and verify token. Supabase issues tokens using HS256 with JWT secret.
            payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)) -> Profile:
    # Supabase stores user UUID in the 'sub' field
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT payload is missing user ID ('sub')"
        )
    
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in JWT"
        )
    
    # Query Profile from DB
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    
    # Auto-create profile if missing (auto-sync with Supabase user record)
    if not profile:
        email = payload.get("email")
        phone = payload.get("phone")
        user_metadata = payload.get("user_metadata", {})
        
        if not phone:
            phone = user_metadata.get("phone") or user_metadata.get("phone_number")
            
        if not email:
            email = user_metadata.get("email") or (f"{phone.replace('+', '')}@phone.placeholder.com" if phone else f"{user_id}@placeholder.com")
            
        full_name = user_metadata.get("full_name") or user_metadata.get("name") or "Local Customer"
        
        # Deduce role (default: customer, check metadata or email)
        role = user_metadata.get("role") or "customer"
        
        # If email contains 'admin' or metadata role is admin, assign admin role
        if "admin" in email.lower() or role == "admin":
            role = "admin"
            
        profile = Profile(
            id=user_id,
            email=email,
            phone=phone,
            full_name=full_name,
            role=role
        )
        
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return profile

# Role enforcement dependency
class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: Profile = Depends(get_current_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted. Insufficient permissions."
            )
        return current_user
