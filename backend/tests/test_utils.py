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


class TestUtilities:
    
    def test_imports(self):
        try:
            from app.utils.auth import jwt_handler
            from app.utils.rate_limiter import rate_limiter
            from app.services.ai_service import ai_service
            from app.services.review_service import review_service
            
            assert jwt_handler is not None
            assert rate_limiter is not None
            assert ai_service is not None
            assert review_service is not None
            
        except ImportError as e:
            pytest.fail(f"Import failed: {e}")