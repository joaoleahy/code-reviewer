import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from jose import JWTError, jwt
import os

class JWTHandler:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', self._generate_secret())
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 60 * 24 * 7
        
    def _generate_secret(self) -> str:
        return secrets.token_urlsafe(32)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access"
        })
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            if payload.get("type") != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    
    def get_token_expiry(self, token: str) -> datetime:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            exp = payload.get("exp")
            return datetime.fromtimestamp(exp, tz=timezone.utc)
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

jwt_handler = JWTHandler()