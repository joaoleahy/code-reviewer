from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from ..utils.auth import jwt_handler
from ..models.user import UserResponse
from ..core.database import get_database
from bson import ObjectId
import asyncio

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[UserResponse]:
    if not credentials:
        return None
    
    try:
        payload = jwt_handler.verify_token(credentials.credentials)
        user_id = payload.get("sub")
        
        if not user_id:
            return None
            
        db = get_database()
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user_doc or not user_doc.get("is_active", True):
            return None
            
        return UserResponse(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            name=user_doc["name"],
            created_at=user_doc["created_at"],
            last_login=user_doc.get("last_login")
        )
        
    except Exception:
        return None

async def require_auth(
    current_user: Optional[UserResponse] = Depends(get_current_user)
) -> UserResponse:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

async def optional_auth(
    current_user: Optional[UserResponse] = Depends(get_current_user)
) -> Optional[UserResponse]:
    return current_user