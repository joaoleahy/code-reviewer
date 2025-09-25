from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os
from pathlib import Path
from dotenv import load_dotenv

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api import reviews, stats, health, auth

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


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

app.include_router(auth.router)
app.include_router(reviews.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(health.router, prefix="/api")

# Serve frontend static files in production
if settings.ENVIRONMENT == "production":
    static_path = Path(__file__).parent / "static"
    if static_path.exists():
        app.mount("/static", StaticFiles(directory=str(static_path)), name="static")
        
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            # API routes should not be caught here
            if full_path.startswith("api/"):
                return {"error": "API route not found"}
            
            # Serve index.html for all non-API routes (SPA routing)
            index_file = static_path / "index.html"
            if index_file.exists():
                return FileResponse(str(index_file))
            return {"error": "Frontend not built"}


# Mount static files (for production)
# Check if frontend build directory exists
frontend_build_path = Path(__file__).parent.parent / "frontend" / "build"
if frontend_build_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_build_path / "static")), name="static")

@app.get("/")
async def root():
    """Serve React app if available, otherwise return API info"""
    frontend_build_path = Path(__file__).parent.parent / "frontend" / "build"
    if frontend_build_path.exists() and (frontend_build_path / "index.html").exists():
        return FileResponse(str(frontend_build_path / "index.html"))
    return {"message": "AI Code Review System API", "version": "1.0.0"}

# Serve React app for all non-API routes (SPA routing)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Catch all non-API routes and serve React app"""
    # Don't serve React app for API routes
    if full_path.startswith(("api/", "docs", "openapi.json", "static/")):
        return {"detail": "Not found"}
    
    frontend_build_path = Path(__file__).parent.parent / "frontend" / "build"
    if frontend_build_path.exists() and (frontend_build_path / "index.html").exists():
        return FileResponse(str(frontend_build_path / "index.html"))
    
    return {"detail": "Not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )
