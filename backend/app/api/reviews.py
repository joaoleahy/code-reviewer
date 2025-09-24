from fastapi import APIRouter, HTTPException, Depends, Request, Query
from fastapi.responses import StreamingResponse
from typing import Optional, List
from datetime import datetime
import io

from ..models.review import CodeSubmission, Review, ReviewResponse, ReviewStatus, ReviewListResponse
from ..services.review_service import review_service
from ..utils.csv_exporter import csv_exporter

router = APIRouter(tags=["reviews"])


def get_client_ip(request: Request) -> str:
    """Get client IP"""
    return request.client.host


@router.post("/reviews", response_model=ReviewResponse)
async def submit_code_review(
    submission: CodeSubmission,
    request: Request
):
    """
    Submit code for review by AI
    """
    try:
        client_ip = get_client_ip(request)
        review_id = await review_service.submit_review(submission, client_ip)
        
        return ReviewResponse(
            id=review_id,
            status=ReviewStatus.PENDING,
            message="Code submitted for review. Use the ID to check status."
        )
        
    except Exception as e:
        if "Rate limit" in str(e):
            raise HTTPException(status_code=429, detail=str(e))
        else:
            raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/reviews/{review_id}", response_model=Review)
async def get_review(review_id: str):
    """
    Get specific review by ID
    """
    try:
        review = await review_service.get_review(review_id)
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        return review
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/reviews", response_model=ReviewListResponse)
async def list_reviews(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    language: Optional[str] = Query(None, description="Filter by language"),
    status: Optional[ReviewStatus] = Query(None, description="Filter by status"),
    start_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date (ISO format)"),
    search_text: Optional[str] = Query(None, description="Search by text in code")
):
    """
    List reviews with pagination and filters
    """
    try:
        return await review_service.list_reviews(
            page=page,
            per_page=per_page,
            language=language,
            status=status,
            start_date=start_date,
            end_date=end_date,
            search_text=search_text
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/reviews/export/csv")
async def export_reviews_csv(
    start_date: datetime = Query(..., description="Start date"),
    end_date: datetime = Query(..., description="End date"),
    languages: List[str] = Query([], description="Filter by languages"),
    min_score: int = Query(1, ge=1, le=10, description="Minimum score"),
    max_score: int = Query(10, ge=1, le=10, description="Maximum score")
):
    """
    Export reviews to CSV
    """
    try:
        # Validar datas
        if start_date >= end_date:
            raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        # Get data
        reviews = await review_service.get_reviews_for_export(
            start_date=start_date,
            end_date=end_date,
            languages=languages,
            min_score=min_score,
            max_score=max_score
        )
        
        if not reviews:
            raise HTTPException(status_code=404, detail="No reviews found for the specified criteria")
        
        # Generate CSV
        csv_content = csv_exporter.export_reviews_to_csv(reviews)
        
        # Return as download
        csv_buffer = io.StringIO(csv_content)
        
        return StreamingResponse(
            io.BytesIO(csv_content.encode('utf-8')),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=reviews_{start_date.date()}_{end_date.date()}.csv"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.delete("/reviews/{review_id}")
async def delete_review(review_id: str):
    """
    Delete review (development/admin only)
    """
    # In production, implement admin authentication
    try:
        from ..core.database import get_database
        from bson import ObjectId
        
        db = get_database()
        result = await db.reviews.delete_one({"_id": ObjectId(review_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        
        return {"message": "Review deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
