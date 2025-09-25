import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.cache_service import CodeCacheService
from app.models.review import ReviewFeedback, ProgrammingLanguage


class TestCacheService:
    
    @pytest.fixture
    def cache_service(self):
        return CodeCacheService()
    
    @pytest.fixture
    def sample_feedback(self):
        return ReviewFeedback(
            quality_score=8,
            issues=["Consider adding error handling"],
            suggestions=["Add type hints"],
            security_concerns=[],
            performance_recommendations=[],
            positive_aspects=["Good code structure"]
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
    async def test_cache_miss_with_no_redis(self, cache_service):
        """Test cache miss when Redis is not available"""
        with patch('app.services.cache_service.redis_client', None):
            result = await cache_service.get_cached_feedback(
                "def test(): pass",
                ProgrammingLanguage.PYTHON
            )
            assert result is None
    
    @pytest.mark.asyncio 
    async def test_cache_hit_with_mock_redis(self, cache_service, sample_feedback):
        """Test cache hit with mocked Redis"""
        mock_redis = MagicMock()
        mock_redis.get = AsyncMock(return_value='{"feedback": {"quality_score": 8, "issues": ["Consider adding error handling"], "suggestions": ["Add type hints"], "security_concerns": [], "performance_recommendations": [], "positive_aspects": ["Good code structure"]}}')
        mock_redis.incr = AsyncMock(return_value=2)
        mock_redis.set = AsyncMock(return_value=True)
        
        with patch('app.services.cache_service.redis_client', mock_redis):
            result = await cache_service.get_cached_feedback(
                "def test(): pass", 
                ProgrammingLanguage.PYTHON
            )
            
            assert result is not None
            assert result.quality_score == 8
            assert "Consider adding error handling" in result.issues
    
    @pytest.mark.asyncio
    async def test_cache_storage_with_mock_redis(self, cache_service, sample_feedback):
        """Test cache storage with mocked Redis"""
        mock_redis = MagicMock()
        mock_redis.set = AsyncMock(return_value=True)
        
        with patch('app.services.cache_service.redis_client', mock_redis):
            result = await cache_service.cache_feedback(
                "def test(): pass",
                ProgrammingLanguage.PYTHON, 
                sample_feedback,
                "Test description",
                2.5
            )
            
            assert result is True
    
    @pytest.mark.asyncio
    async def test_cache_stats_with_no_redis(self, cache_service):
        """Test cache stats when Redis is not available"""
        with patch('app.services.cache_service.redis_client', None):
            stats = await cache_service.get_cache_stats()
            
            assert stats["active_entries"] == 0
            assert stats["cache_hits"] == 0 
            assert stats["cache_misses"] == 0
            assert stats["hit_rate_percent"] == 0.0
    
    @pytest.mark.asyncio
    async def test_cache_clear_with_no_redis(self, cache_service):
        """Test cache clear when Redis is not available"""
        with patch('app.services.cache_service.redis_client', None):
            deleted_count = await cache_service.clear_cache()
            assert deleted_count == 0