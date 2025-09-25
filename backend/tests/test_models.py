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


class TestUserModel:
    
    def test_user_model(self):
        from app.models.user import User
        
        user = User(
            email="test@example.com",
            name="Test User",
            password_hash="hashed_password"
        )
        
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.password_hash == "hashed_password"
    
    def test_password_hashing(self):
        from app.models.user import User
        
        password = "mypassword123"
        hashed = User.hash_password(password)
        
        assert hashed != password
        assert User.verify_password(password, hashed) is True
        assert User.verify_password("wrongpassword", hashed) is False


class TestReviewModel:
    
    def test_review_model(self):
        from app.models.review import Review, ReviewStatus, ProgrammingLanguage
        
        review = Review(
            code="print('hello')",
            language=ProgrammingLanguage.PYTHON,
            description="Test code",
            status=ReviewStatus.PENDING
        )
        
        assert review.code == "print('hello')"
        assert review.language == ProgrammingLanguage.PYTHON
        assert review.status == ReviewStatus.PENDING