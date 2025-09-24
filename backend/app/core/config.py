import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/codereviewer")
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    RATE_LIMIT_PER_HOUR: int = int(os.getenv("RATE_LIMIT_PER_HOUR", "10"))
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    DATABASE_NAME: str = "codereviewer"
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
