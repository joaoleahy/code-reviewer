from fastapi import APIRouter, HTTPException
from datetime import datetime
import asyncio

from ..core.database import get_database
from ..core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify system status
    """
    try:
        current_time = datetime.utcnow()

        mongo_status = await check_mongodb_health()

        config_status = check_config_health()

        # Overall status
        is_healthy = mongo_status and config_status
        
        response = {
            "status": "healthy" if is_healthy else "unhealthy",
            "timestamp": current_time.isoformat(),
            "version": "1.0.0",
            "services": {
                "mongodb": "up" if mongo_status else "down",
                "openai_configured": "yes" if settings.OPENAI_API_KEY else "no"
            },
            "environment": settings.ENVIRONMENT
        }
        
        if settings.ENVIRONMENT == "development":
            response["config"] = {
                "mongodb_uri": settings.MONGODB_URI[:20] + "..." if settings.MONGODB_URI else "not_set",
                "rate_limit": settings.RATE_LIMIT_PER_HOUR,
                "frontend_url": settings.FRONTEND_URL,
                "backend_url": settings.BACKEND_URL
            }
        
        if not is_healthy:
            raise HTTPException(status_code=503, detail=response)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })


async def check_mongodb_health() -> bool:
    """
    Check MongoDB connection health
    """
    try:
        db = get_database()
        if db is None:
            return False
        
        await asyncio.wait_for(db.command("ping"), timeout=5.0)
        return True
        
    except asyncio.TimeoutError:
        print("MongoDB health check timeout")
        return False
    except Exception as e:
        print(f"MongoDB health check failed: {e}")
        return False


def check_config_health() -> bool:
    """
    Verify essential configurations are set
    """
    try:
        if not settings.OPENAI_API_KEY:
            print("OpenAI API key not configured")
            return False
        
        if not settings.MONGODB_URI:
            print("MongoDB URI not configured")
            return False
        
        return True
        
    except Exception as e:
        print(f"Config health check failed: {e}")
        return False


@router.get("/health/detailed")
async def detailed_health_check():
    """
    Health check detail with more diagnostic information
    """
    try:
        current_time = datetime.utcnow()
        
        checks = {
            "mongodb": await detailed_mongodb_check(),
            "openai": await detailed_openai_check(),
            "rate_limiting": check_rate_limiting_health(),
            "disk_space": check_disk_space()
        }
        
        all_healthy = all(check["status"] == "healthy" for check in checks.values())
        
        return {
            "status": "healthy" if all_healthy else "unhealthy",
            "timestamp": current_time.isoformat(),
            "checks": checks
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })


async def detailed_mongodb_check() -> dict:
    """
    Detailed MongoDB health check
    """
    try:
        db = get_database()
        
        start_time = datetime.utcnow()
        await db.command("ping")
        response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        collections = await db.list_collection_names()
        
        reviews_count = await db.reviews.estimated_document_count()
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time, 2),
            "collections": collections,
            "reviews_count": reviews_count
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


async def detailed_openai_check() -> dict:
    """
    Detailed OpenAI configuration check
    """
    return {
        "status": "healthy" if settings.OPENAI_API_KEY else "unhealthy",
        "configured": bool(settings.OPENAI_API_KEY),
        "api_key_length": len(settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else 0
    }


def check_rate_limiting_health() -> dict:
    """
    Verify rate limiting configuration
    """
    return {
        "status": "healthy",
        "rate_limit_per_hour": settings.RATE_LIMIT_PER_HOUR,
        "configured": settings.RATE_LIMIT_PER_HOUR > 0
    }


def check_disk_space() -> dict:
    """
    Placeholder for disk space check
    """
    return {
        "status": "healthy",
        "note": "Disk space check not implemented"
    }
