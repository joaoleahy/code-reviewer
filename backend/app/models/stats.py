from pydantic import BaseModel, Field
from typing import Dict, List
from datetime import datetime


class LanguageStats(BaseModel):
    language: str = Field(..., description="Programming language")
    count: int = Field(..., description="NNumber of reviews")
    average_score: float = Field(..., description="Average score")


class DailyStats(BaseModel):
    date: str = Field(..., description="Date (YYYY-MM-DD)")
    count: int = Field(..., description="NNumber of reviews")
    average_score: float = Field(..., description="Average score")


class CommonIssue(BaseModel):
    issue: str = Field(..., description="Common issue")
    count: int = Field(..., description="Frequency of the issue")


class StatsResponse(BaseModel):
    total_reviews: int = Field(..., description="Total number of reviews")
    total_completed: int = Field(..., description="Total number of completed reviews")
    total_failed: int = Field(..., description="Total number of failed reviews")
    average_quality_score: float = Field(..., description="Overall average quality score")
    average_processing_time: float = Field(..., description="Average processing time")

    language_stats: List[LanguageStats] = Field(default=[], description="Language statistics")

    daily_stats: List[DailyStats] = Field(default=[], description="Daily statistics for the last 30 days")

    common_issues: List[CommonIssue] = Field(default=[], description="Common issues")

    score_distribution: Dict[str, int] = Field(default={}, description="Score distribution")


class ExportRequest(BaseModel):
    start_date: datetime = Field(..., description="Start date")
    end_date: datetime = Field(..., description="End date")
    languages: List[str] = Field(default=[], description="Filter by languages")
    min_score: int = Field(default=1, description="Minimum score")
    max_score: int = Field(default=10, description="Maximum score")
