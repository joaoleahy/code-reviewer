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


class TestAIService:
    
    def test_ai_service_instance(self):
        from app.services.ai_service import AIService
        
        service = AIService()
        assert hasattr(service, 'api_key')
        assert hasattr(service, 'base_url')
        assert hasattr(service, 'review_code')
    
    def test_build_prompt(self):
        from app.services.ai_service import AIService
        from app.models.review import ProgrammingLanguage
        
        service = AIService()
        prompt = service._build_review_prompt("print('hello')", ProgrammingLanguage.PYTHON, "Test script")
        
        assert "python" in prompt.lower()
        assert "print('hello')" in prompt