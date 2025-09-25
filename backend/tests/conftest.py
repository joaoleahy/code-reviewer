"""
Simplified configuration for pytest
"""
import pytest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@pytest.fixture(autouse=True)
def setup_environment():
    """Basic setup for all tests"""
    os.environ['TESTING'] = 'true'
    os.environ['JWT_SECRET_KEY'] = 'test-secret-for-testing'
    yield
    if 'TESTING' in os.environ:
        del os.environ['TESTING']

@pytest.fixture
def sample_user_data():
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "TestPassword123!"
    }

@pytest.fixture
def sample_code():
    return {
        "code": "def hello():\n    print('Hello, World!')",
        "language": "python",
        "description": "Simple hello function"
    }