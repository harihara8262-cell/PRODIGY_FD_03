from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.models import Profile
from backend.schemas.schemas import ProfileUpdate, ProfileResponse
from backend.middleware.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=ProfileResponse)
def get_user_profile(current_user: Profile = Depends(get_current_user)):
    """
    Returns the profile information of the currently authenticated user.
    """
    return current_user

@router.put("", response_model=ProfileResponse)
def update_user_profile(
    profile_data: ProfileUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the profile information (full_name, phone, address) of the currently authenticated user.
    """
    update_fields = profile_data.model_dump(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    return current_user
