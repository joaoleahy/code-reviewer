from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

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

static_dir = "../frontend/build/static"
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(404, "Not Found")
    
    index_path = "../frontend/build/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(404, "Frontend not available")

@app.get("/")
async def root():
    index_path = "../frontend/build/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "AI Code Review System API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=False
    )