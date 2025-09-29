from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["cache"], prefix="/cache")


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