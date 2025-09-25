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


class TestReviewService:
    
    def test_review_service_instance(self):
        from app.services.review_service import ReviewService
        
        service = ReviewService()
        assert hasattr(service, 'submit_review')
        assert hasattr(service, 'get_review')
        assert hasattr(service, 'list_reviews')