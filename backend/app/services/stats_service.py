from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import Counter
from pymongo import DESCENDING

from ..core.database import get_database
from ..models.review import ReviewStatus
from ..models.stats import StatsResponse, LanguageStats, DailyStats, CommonIssue


class StatsService:
    def __init__(self):
        pass
    
    async def get_statistics(self) -> StatsResponse:
        """
        Get general system statistics
        """
        try:
            db = get_database()
            
            total_reviews = await db.reviews.count_documents({})
            total_completed = await db.reviews.count_documents({"status": ReviewStatus.COMPLETED})
            total_failed = await db.reviews.count_documents({"status": ReviewStatus.FAILED})
            
            pipeline_avg = [
                {"$match": {"status": ReviewStatus.COMPLETED, "feedback.quality_score": {"$exists": True}}},
                {"$group": {
                    "_id": None,
                    "avg_score": {"$avg": "$feedback.quality_score"},
                    "avg_processing_time": {"$avg": "$processing_time"}
                }}
            ]
            
            avg_results = await db.reviews.aggregate(pipeline_avg).to_list(length=1)
            average_quality_score = avg_results[0]["avg_score"] if avg_results else 0.0
            average_processing_time = avg_results[0]["avg_processing_time"] if avg_results else 0.0
            
            language_stats = await self._get_language_stats()
            
            daily_stats = await self._get_daily_stats()
            
            common_issues = await self._get_common_issues()
            
            score_distribution = await self._get_score_distribution()
            
            return StatsResponse(
                total_reviews=total_reviews,
                total_completed=total_completed,
                total_failed=total_failed,
                average_quality_score=round(average_quality_score, 2),
                average_processing_time=round(average_processing_time, 3),
                language_stats=language_stats,
                daily_stats=daily_stats,
                common_issues=common_issues,
                score_distribution=score_distribution
            )
            
        except Exception as e:
            print(f"Error getting statistics: {e}")
            return StatsResponse(
                total_reviews=0,
                total_completed=0,
                total_failed=0,
                average_quality_score=0.0,
                average_processing_time=0.0
            )
    
    async def _get_language_stats(self) -> List[LanguageStats]:
        """
        Get statistics by programming language
        """
        try:
            db = get_database()
            
            pipeline = [
                {"$match": {"status": ReviewStatus.COMPLETED}},
                {"$group": {
                    "_id": "$language",
                    "count": {"$sum": 1},
                    "avg_score": {"$avg": "$feedback.quality_score"}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            
            results = await db.reviews.aggregate(pipeline).to_list(length=10)
            
            language_stats = []
            for result in results:
                language_stats.append(LanguageStats(
                    language=result["_id"],
                    count=result["count"],
                    average_score=round(result["avg_score"] if result["avg_score"] else 0, 2)
                ))
            
            return language_stats
            
        except Exception as e:
            print(f"Error getting language stats: {e}")
            return []
    
    async def _get_daily_stats(self) -> List[DailyStats]:
        """
        Get daily statistics for the last 30 days
        """
        try:
            db = get_database()
            
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            pipeline = [
                {"$match": {
                    "created_at": {"$gte": thirty_days_ago},
                    "status": ReviewStatus.COMPLETED
                }},
                {"$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$created_at"
                        }
                    },
                    "count": {"$sum": 1},
                    "avg_score": {"$avg": "$feedback.quality_score"}
                }},
                {"$sort": {"_id": 1}}
            ]
            
            results = await db.reviews.aggregate(pipeline).to_list(length=None)
            
            daily_stats = []
            for result in results:
                daily_stats.append(DailyStats(
                    date=result["_id"],
                    count=result["count"],
                    average_score=round(result["avg_score"] if result["avg_score"] else 0, 2)
                ))
            
            return daily_stats
            
        except Exception as e:
            print(f"Error getting daily stats: {e}")
            return []
    
    async def _get_common_issues(self) -> List[CommonIssue]:
        """
        Get most common issues identified by AI
        """
        try:
            db = get_database()
            
            cursor = db.reviews.find({
                "status": ReviewStatus.COMPLETED,
                "feedback.issues": {"$exists": True}
            })
            
            all_issues = []
            async for review in cursor:
                issues = review.get("feedback", {}).get("issues", [])
                all_issues.extend(issues)
            
            issue_counter = Counter(all_issues)
            
            common_issues = []
            for issue, count in issue_counter.most_common(10):
                common_issues.append(CommonIssue(
                    issue=issue,
                    count=count
                ))
            
            return common_issues
            
        except Exception as e:
            print(f"Error getting common issues: {e}")
            return []
    
    async def _get_score_distribution(self) -> Dict[str, int]:
        """
        Get score distribution
        """
        try:
            db = get_database()
            
            pipeline = [
                {"$match": {"status": ReviewStatus.COMPLETED}},
                {"$group": {
                    "_id": "$feedback.quality_score",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]
            
            results = await db.reviews.aggregate(pipeline).to_list(length=None)
            
            distribution = {}
            for i in range(1, 11):
                distribution[str(i)] = 0
            
            for result in results:
                score = str(result["_id"]) if result["_id"] else "0"
                if score in distribution:
                    distribution[score] = result["count"]
            
            return distribution
            
        except Exception as e:
            print(f"Error getting score distribution: {e}")
            return {str(i): 0 for i in range(1, 11)}


stats_service = StatsService()
