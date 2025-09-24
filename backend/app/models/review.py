from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ReviewStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ProgrammingLanguage(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"
    CPP = "cpp"
    CSHARP = "csharp"
    GO = "go"
    RUST = "rust"
    PHP = "php"
    RUBY = "ruby"
    OTHER = "other"


class CodeSubmission(BaseModel):
    code: str = Field(..., min_length=1, max_length=10000, description="Code to be reviewed")
    language: ProgrammingLanguage = Field(..., description="Programming language")
    description: Optional[str] = Field(None, max_length=500, description="Optional code description")


class ReviewFeedback(BaseModel):
    quality_score: int = Field(..., ge=1, le=10, description="Quality score (1-10)")
    issues: List[str] = Field(default=[], description="Identified issues")
    suggestions: List[str] = Field(default=[], description="Improvement suggestions")
    security_concerns: List[str] = Field(default=[], description="Security concerns")
    performance_recommendations: List[str] = Field(default=[], description="Performance recommendations")
    positive_aspects: List[str] = Field(default=[], description="Positive aspects of the code")
    cost_info: Optional[Dict[str, Any]] = Field(default=None, description="Cost information of the request")


class Review(BaseModel):
    id: Optional[str] = Field(None, description="Unique review ID")
    code: str = Field(..., description="Reviewed code")
    language: ProgrammingLanguage = Field(..., description="Programming language")
    description: Optional[str] = Field(None, description="Optional code description")
    status: ReviewStatus = Field(default=ReviewStatus.PENDING, description="Review status")
    feedback: Optional[ReviewFeedback] = Field(None, description="AI feedback")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation date")
    completed_at: Optional[datetime] = Field(None, description="Completion date")
    ip_address: Optional[str] = Field(None, description="Client IP address")
    user_id: Optional[str] = Field(None, description="User ID who submitted the review")
    user_email: Optional[str] = Field(None, description="User email for quick reference")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    error_message: Optional[str] = Field(None, description="Error message if failed")

    class Config:
        json_schema_extra = {
            "example": {
                "code": "def hello():\n    print('Hello World')",
                "language": "python",
                "description": "Simple hello world function",
                "status": "pending"
            }
        }


class ReviewResponse(BaseModel):
    id: str = Field(..., description="Unique review ID")
    status: ReviewStatus = Field(..., description="Current status")
    message: str = Field(..., description="Response message")


class ReviewListResponse(BaseModel):
    reviews: List[Review] = Field(..., description="List of reviews")
    total: int = Field(..., description="Total number of reviews")
    page: int = Field(..., description="Current page")
    per_page: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
