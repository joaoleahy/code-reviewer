import httpx
import json
import time
from typing import Optional

from ..core.config import settings
from ..models.review import ReviewFeedback, ProgrammingLanguage
from .cache_service import cache_service


class AIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1"
        
    async def review_code(self, code: str, language: ProgrammingLanguage, description: Optional[str] = None) -> ReviewFeedback:
        """
        Review code using OpenAI GPT-5-mini via direct HTTP API with caching
        """
        start_time = time.time()
        
        try:
            cached_feedback = await cache_service.get_cached_feedback(code, language, description)
            if cached_feedback:
                print(f"Returned cached result in {time.time() - start_time:.3f}s")
                return cached_feedback
            
            print("Cache miss - calling AI service...")
            prompt = self._build_review_prompt(code, language, description)
                        
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            payload = {
                "model": "gpt-5-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a code review expert. Analyze code and respond ONLY with valid JSON. Be direct and concise."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "temperature": 0.2,
                 "max_completion_tokens": 2000,
                "response_format": {"type": "json_object"}
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                )
                
                if response.status_code != 200:
                    raise Exception(f"OpenAI API error {response.status_code}: {response.text}")
                
                response_data = response.json()
            
            content = response_data["choices"][0]["message"]["content"]
            feedback_data = json.loads(content)
            
            feedback = self._parse_feedback(feedback_data)
            
            processing_time = time.time() - start_time
            await cache_service.cache_feedback(code, language, feedback, description, processing_time)
            
            print(f"AI analysis completed in {processing_time:.3f}s")
            return feedback
            
        except json.JSONDecodeError as e:
            raise Exception(f"Error parsing AI response: {e}")
        except Exception as e:
            raise Exception(f"Error in code review: {e}")
    
    def _build_review_prompt(self, code: str, language: ProgrammingLanguage, description: Optional[str]) -> str:
        """
        Build prompt for code review
        """
        
        language_tips = {
            "python": "Focus on PEP 8, exception handling, performance and security.",
            "javascript": "Analyze var/let/const usage, async/await, DOM manipulation and performance.",
            "typescript": "Check typing, interfaces, generics and TypeScript best practices.",
            "java": "Analyze OOP, exception handling, performance and design patterns.",
            "cpp": "Focus on memory management, performance and C++ patterns.",
            "csharp": "Analyze LINQ, async/await, garbage collection and .NET patterns.",
            "go": "Check goroutines, channels, error handling and Go idioms.",
            "rust": "Analyze ownership, borrowing, safety and performance.",
            "php": "Focus on security, PSRs, performance and modern best practices.",
            "ruby": "Analyze Ruby idioms, gems, performance and Rails patterns."
        }
        
        language_str = language if isinstance(language, str) else language.value
        specific_tips = language_tips.get(language_str, "Analyze language best practices.")
        
        prompt = f"""Analyze this {language_str} code. {specific_tips}

CODE:
```{language_str}
{code}
```

{f"CONTEXT: {description}" if description else ""}

Return JSON only:
{{
    "quality_score": 7,
    "issues": ["specific problems found"],
    "suggestions": ["practical improvements"],
    "security_concerns": ["security issues"],
    "performance_recommendations": ["performance and optimization tips"],
    "positive_aspects": ["good practices"]
}}"""
        return prompt
    
    def _parse_feedback(self, feedback_data: dict) -> ReviewFeedback:
        """
        Parse and validation of AI feedback
        """
        try:
            quality_score = int(feedback_data.get("quality_score", 5))
            quality_score = max(1, min(10, quality_score))
            
            feedback = ReviewFeedback(
                quality_score=quality_score,
                issues=feedback_data.get("issues", []),
                suggestions=feedback_data.get("suggestions", []),
                security_concerns=feedback_data.get("security_concerns", []),
                performance_recommendations=feedback_data.get("performance_recommendations", []),
                positive_aspects=feedback_data.get("positive_aspects", [])
            )
            
            return feedback
            
        except Exception as e:
            return ReviewFeedback(
                quality_score=5,
                issues=["Error processing AI feedback"],
                suggestions=["Try resubmitting the code for review"],
                security_concerns=[],
                performance_recommendations=[],
                positive_aspects=[]
            )


ai_service = AIService()
