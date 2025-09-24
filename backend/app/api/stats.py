from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import io

from ..models.stats import StatsResponse
from ..models.user import UserResponse
from ..services.stats_service import stats_service
from ..utils.csv_exporter import csv_exporter
from ..utils.dependencies import require_auth

router = APIRouter(tags=["statistics"])


@router.get("/stats", response_model=StatsResponse)
async def get_statistics(current_user: UserResponse = Depends(require_auth)):
    """
    Get user-specific statistics
    """
    try:
        return await stats_service.get_statistics(user_id=current_user.id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/stats/export/csv")
async def export_stats_csv(current_user: UserResponse = Depends(require_auth)):
    """
    Export user statistics to CSV
    """
    try:
        stats = await stats_service.get_statistics(user_id=current_user.id)
        stats_dict = stats.dict()
        
        csv_content = csv_exporter.export_stats_to_csv(stats_dict)
        
        return StreamingResponse(
            io.BytesIO(csv_content.encode('utf-8')),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=user_statistics.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/stats/summary")
async def get_stats_summary(current_user: UserResponse = Depends(require_auth)):
    """
    Get quick statistics summary for user (for dashboard)
    """
    try:
        stats = await stats_service.get_statistics(user_id=current_user.id)
        
        return {
            "total_reviews": stats.total_reviews,
            "total_completed": stats.total_completed,
            "success_rate": round((stats.total_completed / stats.total_reviews * 100) if stats.total_reviews > 0 else 0, 1),
            "average_score": stats.average_quality_score,
            "top_language": stats.language_stats[0].language if stats.language_stats else "N/A",
            "most_common_issue": stats.common_issues[0].issue if stats.common_issues else "No common issues"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/stats/languages")
async def get_language_statistics():
    """
    Get only statistics by language
    """
    try:
        stats = await stats_service.get_statistics()
        return {
            "language_stats": [lang.dict() for lang in stats.language_stats]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/stats/trends")
async def get_trends():
    """
    Get trend data (daily statistics)
    """
    try:
        stats = await stats_service.get_statistics()
        return {
            "daily_stats": [daily.dict() for daily in stats.daily_stats],
            "score_distribution": stats.score_distribution
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/stats/issues")
async def get_common_issues():
    """
    Get only most common issues
    """
    try:
        stats = await stats_service.get_statistics()
        return {
            "common_issues": [issue.dict() for issue in stats.common_issues]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
