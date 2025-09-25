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


class TestConfig:
    
    def test_settings_load(self):
        from app.core.config import settings
        
        assert hasattr(settings, 'MONGODB_URI')
        assert hasattr(settings, 'JWT_SECRET_KEY')
        assert hasattr(settings, 'OPENAI_API_KEY')
    
    def test_environment_detection(self):
        from app.core.config import settings
        
        assert os.environ.get('TESTING') == 'true'