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


class TestProgrammingLanguages:
    
    def test_programming_languages_enum(self):
        from app.models.review import ProgrammingLanguage
        
        assert ProgrammingLanguage.PYTHON == "python"
        assert ProgrammingLanguage.JAVASCRIPT == "javascript"
        assert ProgrammingLanguage.JAVA == "java"
        assert ProgrammingLanguage.TYPESCRIPT == "typescript"
    
    def test_language_validation(self):
        from app.models.review import ProgrammingLanguage
        
        valid_languages = [lang.value for lang in ProgrammingLanguage]
        
        assert "python" in valid_languages
        assert "javascript" in valid_languages
        assert len(valid_languages) > 5


class TestReviewStatuses:
    
    def test_review_status_enum(self):
        from app.models.review import ReviewStatus
        
        assert ReviewStatus.PENDING == "pending"
        assert ReviewStatus.IN_PROGRESS == "in_progress"
        assert ReviewStatus.COMPLETED == "completed"
        assert ReviewStatus.FAILED == "failed"