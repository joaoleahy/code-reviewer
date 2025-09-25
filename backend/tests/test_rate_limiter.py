import pytest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@pytest.fixture(autouse=True)
def setup_test_env():
    os.environ['TESTING'] = 'true'
    yield
    if 'TESTING' in os.environ:
        del os.environ['TESTING']


class TestRateLimiter:
    
    def test_rate_limiter_creation(self):
        from app.utils.rate_limiter import RateLimiter
        
        limiter = RateLimiter()
        assert hasattr(limiter, '_cache')
        assert hasattr(limiter, '_lock')
    
    @pytest.mark.asyncio
    async def test_rate_limiter_allows_first_request(self):
        from app.utils.rate_limiter import RateLimiter
        
        limiter = RateLimiter()
        result = await limiter.check_rate_limit("192.168.1.1")
        assert result is True