from fastapi import APIRouter, HTTPException, status, Depends, Request
from datetime import datetime, timezone
from ..models.user import User, UserLogin, UserRegister, UserResponse, AuthToken
from ..utils.auth import jwt_handler
from ..utils.dependencies import require_auth, optional_auth
from ..utils.rate_limiter import RateLimiter
from ..core.database import get_database

router = APIRouter(tags=["authentication"])
rate_limiter = RateLimiter()

@router.post("/register", response_model=AuthToken)
async def register(user_data: UserRegister, request: Request):
    """Register a new user"""
    client_ip = request.client.host
    
    if not await rate_limiter.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts. Please try again later."
        )
    
    db = get_database()
    
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=User.hash_password(user_data.password),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    result = await db.users.insert_one(user.dict(exclude={"id"}))
    user_doc = await db.users.find_one({"_id": result.inserted_id})
    
    user_response = UserResponse(
        id=str(user_doc["_id"]),
        email=user_doc["email"],
        name=user_doc["name"],
        created_at=user_doc["created_at"],
        last_login=user_doc.get("last_login")
    )
    
    access_token = jwt_handler.create_access_token(
        data={"sub": str(user_doc["_id"]), "email": user_doc["email"]}
    )
    
    return AuthToken(
        access_token=access_token,
        expires_in=jwt_handler.access_token_expire_minutes * 60,
        user=user_response
    )

@router.post("/login", response_model=AuthToken)
async def login(user_data: UserLogin, request: Request):
    """Login with email and password"""
    client_ip = request.client.host
    
    if not await rate_limiter.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    db = get_database()
    
    user_doc = await db.users.find_one({"email": user_data.email})
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not User.verify_password(user_data.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    await db.users.update_one(
        {"_id": user_doc["_id"]},
        {
            "$set": {
                "last_login": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    user_response = UserResponse(
        id=str(user_doc["_id"]),
        email=user_doc["email"],
        name=user_doc["name"],
        created_at=user_doc["created_at"],
        last_login=datetime.now(timezone.utc)
    )
    
    access_token = jwt_handler.create_access_token(
        data={"sub": str(user_doc["_id"]), "email": user_doc["email"]}
    )
    
    return AuthToken(
        access_token=access_token,
        expires_in=jwt_handler.access_token_expire_minutes * 60,
        user=user_response
    )

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: UserResponse = Depends(require_auth)):
    return current_user

@router.post("/logout")
async def logout(current_user: UserResponse = Depends(require_auth)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(require_auth)):
    return current_user