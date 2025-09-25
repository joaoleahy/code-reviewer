import pytest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@pytest.fixture(autouse=True)
def setup_test_env():
    os.environ['TESTING'] = 'true'
    os.environ['JWT_SECRET_KEY'] = 'test-secret-key'
    yield
    if 'TESTING' in os.environ:
        del os.environ['TESTING']


class TestJWTHandler:
    
    def test_create_token(self):
        from app.utils.auth import jwt_handler
        
        payload = {"sub": "user123", "email": "test@example.com"}
        token = jwt_handler.create_access_token(payload)
        
        assert isinstance(token, str)
        assert len(token) > 50
    
    def test_verify_valid_token(self):
        from app.utils.auth import jwt_handler
        
        payload = {"sub": "user123", "email": "test@example.com"}
        token = jwt_handler.create_access_token(payload)
        
        decoded = jwt_handler.verify_token(token)
        assert decoded["sub"] == "user123"
        assert decoded["email"] == "test@example.com"
    
    def test_verify_invalid_token(self):
        from app.utils.auth import jwt_handler
        from fastapi import HTTPException
        
        with pytest.raises(HTTPException):
            jwt_handler.verify_token("invalid.token.here")