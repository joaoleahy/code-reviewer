from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api import reviews, stats, health, auth, cache

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    
    from app.core.redis_client import redis_client
    await redis_client.connect()
    
    yield
    
    await close_mongo_connection()
    await redis_client.close()


app = FastAPI(
    title="AI Code Review System",
    description="AI-powered code review and feedback system",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(reviews.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(cache.router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI Code Review System API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_simple:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )