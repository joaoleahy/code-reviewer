import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from app.services.cache_service import CodeCacheService
from app.models.review import ReviewFeedback, ProgrammingLanguage


class TestCacheService:
    
    @pytest.fixture
    def cache_service(self):
        return CodeCacheService()
    
    @pytest.fixture
    def sample_feedback(self):
        return ReviewFeedback(
            summary="Good code structure",
            issues=["Consider adding error handling"],
            suggestions=["Add type hints"],
            overall_score=8,
            complexity_score=6,
            maintainability_score=9,
            performance_score=7
        )
    
    @pytest.mark.asyncio
    async def test_generate_code_hash(self, cache_service):
        code = "def hello():\n    print('Hello')"
        language = ProgrammingLanguage.PYTHON
        description = "Test function"
        
        hash1 = cache_service._generate_code_hash(code, language, description)
        hash2 = cache_service._generate_code_hash(code, language, description)
        
        assert hash1 == hash2
        assert hash1.startswith("code_cache:")
        assert len(hash1) > 20
    
    @pytest.mark.asyncio
    async def test_cache_miss(self, cache_service):
        with patch('app.core.redis_client.redis_client') as mock_redis:
            mock_redis.get = AsyncMock(return_value=None)
            
            result = await cache_service.get_cached_feedback(
                "def test(): pass",
                ProgrammingLanguage.PYTHON
            )
            
            assert result is None
            mock_redis.get.assert_called_once()
    
    @pytest.mark.asyncio 
    async def test_cache_hit(self, cache_service, sample_feedback):
        cached_data = {
            "feedback": sample_feedback.dict(),
            "language": "python",
            "created_at": "2025-09-25T10:00:00",
            "usage_count": 1
        }
        
        with patch('app.core.redis_client.redis_client') as mock_redis:
            mock_redis.get = AsyncMock(return_value='{"feedback": {"summary": "Good code structure", "issues": ["Consider adding error handling"], "suggestions": ["Add type hints"], "overall_score": 8, "complexity_score": 6, "maintainability_score": 9, "performance_score": 7}}')
            mock_redis.incr = AsyncMock(return_value=2)
            mock_redis.set = AsyncMock(return_value=True)
            
            result = await cache_service.get_cached_feedback(
                "def test(): pass", 
                ProgrammingLanguage.PYTHON
            )
            
            assert result is not None
            assert result.summary == "Good code structure"
            assert result.overall_score == 8
            mock_redis.get.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_cache_storage(self, cache_service, sample_feedback):
        with patch('app.core.redis_client.redis_client') as mock_redis:
            mock_redis.set = AsyncMock(return_value=True)
            
            result = await cache_service.cache_feedback(
                "def test(): pass",
                ProgrammingLanguage.PYTHON, 
                sample_feedback,
                "Test description",
                2.5
            )
            
            assert result is True
            mock_redis.set.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_cache_stats(self, cache_service):
        with patch('app.core.redis_client.redis_client') as mock_redis:
            mock_redis.keys = AsyncMock(return_value=["code_cache:abc123", "code_cache:def456"])
            mock_redis.get = AsyncMock(side_effect=["5", "3", "8", "1", '{"language": "python", "created_at": "2025-09-25T10:00:00"}', "2"])
            
            stats = await cache_service.get_cache_stats()
            
            assert stats["active_entries"] == 2
            assert stats["cache_hits"] == 5
            assert stats["cache_misses"] == 3
            assert stats["hit_rate_percent"] == 62.5
    
    @pytest.mark.asyncio
    async def test_cache_clear(self, cache_service):
        with patch('app.core.redis_client.redis_client') as mock_redis:
            mock_redis.keys = AsyncMock(return_value=["code_cache:abc123", "cache:stats:hits"])
            mock_redis.delete = AsyncMock(return_value=True)
            
            deleted_count = await cache_service.clear_cache()
            
            assert deleted_count == 2
            assert mock_redis.delete.call_count == 2