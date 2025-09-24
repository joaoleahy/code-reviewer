import asyncio
import time
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from bson import ObjectId
from pymongo.errors import PyMongoError

from ..core.database import get_database
from ..models.review import Review, ReviewStatus, CodeSubmission, ReviewListResponse
from ..utils.rate_limiter import check_rate_limit
from .ai_service import ai_service


class ReviewService:
    def __init__(self):
        pass
    
    async def submit_review(self, submission: CodeSubmission, ip_address: str) -> str:
        """
        Submit code for review
        """
        if not await check_rate_limit(ip_address):
            raise Exception("Rate limit exceeded. Please try again later.")
        
        review = Review(
            code=submission.code,
            language=submission.language,
            description=submission.description,
            status=ReviewStatus.PENDING,
            ip_address=ip_address,
            created_at=datetime.utcnow()
        )
        
        db = get_database()
        result = await db.reviews.insert_one(review.dict())
        review_id = str(result.inserted_id)
        
        asyncio.create_task(self._process_review(review_id))
        
        return review_id
    
    async def _process_review(self, review_id: str):
        """
        Process review in background
        """
        db = get_database()
        start_time = time.time()
        
        try:
            # Update status to in_progress
            await db.reviews.update_one(
                {"_id": ObjectId(review_id)},
                {"$set": {"status": ReviewStatus.IN_PROGRESS}}
            )
            
            # Fetch review
            review_doc = await db.reviews.find_one({"_id": ObjectId(review_id)})
            if not review_doc:
                raise Exception("Review not found")
            
            # Perform AI review
            feedback = await ai_service.review_code(
                code=review_doc["code"],
                language=review_doc["language"],
                description=review_doc.get("description")
            )
            
            processing_time = time.time() - start_time
            
            await db.reviews.update_one(
                {"_id": ObjectId(review_id)},
                {
                    "$set": {
                        "status": ReviewStatus.COMPLETED,
                        "feedback": feedback.dict(),
                        "completed_at": datetime.utcnow(),
                        "processing_time": processing_time
                    }
                }
            )
            
        except Exception as e:
            await db.reviews.update_one(
                {"_id": ObjectId(review_id)},
                {
                    "$set": {
                        "status": ReviewStatus.FAILED,
                        "error_message": str(e),
                        "completed_at": datetime.utcnow()
                    }
                }
            )
    
    async def get_review(self, review_id: str) -> Optional[Review]:
        """
        Get specific review
        """
        try:
            db = get_database()
            review_doc = await db.reviews.find_one({"_id": ObjectId(review_id)})
            
            if not review_doc:
                return None
                
            review_doc["id"] = str(review_doc["_id"])
            del review_doc["_id"]
            
            return Review(**review_doc)
            
        except Exception as e:
            print(f"Error fetching review: {e}")
            return None
    
    async def list_reviews(
        self, 
        page: int = 1, 
        per_page: int = 10,
        language: Optional[str] = None,
        status: Optional[ReviewStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search_text: Optional[str] = None
    ) -> ReviewListResponse:
        """
        List reviews with pagination and filters
        """
        try:
            db = get_database()
            
            # Build filters
            filters = {}
            if language:
                filters["language"] = language
            if status:
                filters["status"] = status
            if start_date or end_date:
                date_filter = {}
                if start_date:
                    date_filter["$gte"] = start_date
                if end_date:
                    date_filter["$lte"] = end_date
                filters["created_at"] = date_filter
            if search_text:
                filters["code"] = {"$regex": search_text, "$options": "i"}
            
            total = await db.reviews.count_documents(filters)
            
            # Calculate pagination
            skip = (page - 1) * per_page
            total_pages = (total + per_page - 1) // per_page
            
            cursor = db.reviews.find(filters).sort("created_at", -1).skip(skip).limit(per_page)
            review_docs = await cursor.to_list(length=per_page)
            
            reviews = []
            for doc in review_docs:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
                reviews.append(Review(**doc))
            
            return ReviewListResponse(
                reviews=reviews,
                total=total,
                page=page,
                per_page=per_page,
                total_pages=total_pages
            )
            
        except Exception as e:
            print(f"Error listing reviews: {e}")
            return ReviewListResponse(
                reviews=[],
                total=0,
                page=page,
                per_page=per_page,
                total_pages=0
            )
    
    async def get_reviews_for_export(
        self,
        start_date: datetime,
        end_date: datetime,
        languages: List[str] = None,
        min_score: int = 1,
        max_score: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get reviews for CSV export
        """
        try:
            db = get_database()
            
            filters = {
                "created_at": {"$gte": start_date, "$lte": end_date},
                "status": ReviewStatus.COMPLETED,
                "feedback.quality_score": {"$gte": min_score, "$lte": max_score}
            }
            
            if languages:
                filters["language"] = {"$in": languages}
            
            cursor = db.reviews.find(filters).sort("created_at", -1)
            reviews = await cursor.to_list(length=None)
            
            formatted_reviews = []
            for review in reviews:
                formatted_review = {
                    "id": str(review["_id"]),
                    "language": review["language"],
                    "quality_score": review.get("feedback", {}).get("quality_score", "N/A"),
                    "created_at": review["created_at"].isoformat(),
                    "processing_time": review.get("processing_time", "N/A"),
                    "issues_count": len(review.get("feedback", {}).get("issues", [])),
                    "suggestions_count": len(review.get("feedback", {}).get("suggestions", [])),
                    "security_concerns_count": len(review.get("feedback", {}).get("security_concerns", [])),
                }
                formatted_reviews.append(formatted_review)
            
            return formatted_reviews
            
        except Exception as e:
            print(f"Error fetching reviews for export: {e}")
            return []


review_service = ReviewService()
