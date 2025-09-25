from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from ..services.cache_service import cache_service
from ..models.user import UserResponse
from ..utils.dependencies import require_auth

router = APIRouter(tags=["cache"], prefix="/cache")


@router.get("/stats", response_model=Dict[str, Any])
async def get_cache_stats(current_user: UserResponse = Depends(require_auth)):
    """
    Get cache statistics - requires authentication
    """
    try:
        stats = await cache_service.get_cache_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting cache stats: {str(e)}")


@router.post("/cleanup")
async def cleanup_expired_cache(current_user: UserResponse = Depends(require_auth)):
    """
    Manually trigger cleanup of expired cache entries
    """
    try:
        removed_count = await cache_service.clean_expired_cache()
        return {
            "message": f"Cleanup completed",
            "removed_entries": removed_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning cache: {str(e)}")


@router.delete("/clear")
async def clear_all_cache():
    """
    Clear all cache entries (development/admin only)
    WARNING: This will force all future requests to use AI service
    """
    try:
        from ..core.database import get_database
        
        db = get_database()
        result = await db.code_cache.delete_many({})
        
        return {
            "message": f"All cache cleared",
            "removed_entries": result.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {str(e)}")