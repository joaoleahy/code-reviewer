import hashlib
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from ..core.redis_client import redis_client
from ..models.review import ReviewFeedback, ProgrammingLanguage

logger = logging.getLogger(__name__)


class CodeCacheService:
    
    def __init__(self):
        self.cache_ttl_seconds = 2592000
        self.stats_key = "cache:stats"
    
    def _generate_code_hash(self, code: str, language: ProgrammingLanguage, description: Optional[str] = None) -> str:
        normalized_code = ' '.join(code.strip().split()).lower()
        cache_key = f"{normalized_code}|{language}|{description or ''}"
        hash_value = hashlib.sha256(cache_key.encode('utf-8')).hexdigest()
        return f"code_cache:{hash_value}"
    
    async def get_cached_feedback(
        self, 
        code: str, 
        language: ProgrammingLanguage, 
        description: Optional[str] = None
    ) -> Optional[ReviewFeedback]:
        try:
            cache_key = self._generate_code_hash(code, language, description)
            
            cached_data = await redis_client.get(cache_key)
            
            if cached_data:
                logger.debug(f"Cache HIT for hash: {cache_key[-12:]}...")
                
                feedback_data = json.loads(cached_data)
                
                await self._increment_usage_count(cache_key)
                
                await self._update_stats("hits")
                
                return ReviewFeedback(**feedback_data["feedback"])
            
            logger.debug(f"Cache MISS for hash: {cache_key[-12:]}...")
            await self._update_stats("misses")
            return None
            
        except Exception as e:
            logger.error(f"Error checking cache: {e}")
            await self._update_stats("errors")
            return None
    
    async def cache_feedback(
        self, 
        code: str, 
        language: ProgrammingLanguage, 
        feedback: ReviewFeedback,
        description: Optional[str] = None,
        processing_time: Optional[float] = None
    ) -> bool:
        try:
            cache_key = self._generate_code_hash(code, language, description)
            
            cache_entry = {
                "feedback": feedback.dict(),
                "language": language,
                "description": description,
                "processing_time": processing_time,
                "created_at": datetime.utcnow().isoformat(),
                "usage_count": 0
            }
            
            success = await redis_client.set(
                cache_key, 
                json.dumps(cache_entry, default=str),
                ex=self.cache_ttl_seconds
            )
            
            if success:
                logger.debug(f"Cached feedback for hash: {cache_key[-12:]}...")
                await self._update_stats("cached")
                return True
            else:
                logger.warning(f"Failed to cache feedback for hash: {cache_key[-12:]}...")
                return False
            
        except Exception as e:
            logger.error(f"Error caching feedback: {e}")
            await self._update_stats("cache_errors")
            return False
    
    async def _increment_usage_count(self, cache_key: str) -> bool:
        try:
            usage_key = f"{cache_key}:usage"
            await redis_client.incr(usage_key)
            await redis_client.set(usage_key, await redis_client.get(usage_key), ex=self.cache_ttl_seconds)
            return True
        except Exception as e:
            logger.error(f"Error incrementing cache usage: {e}")
            return False
    
    async def _update_stats(self, stat_type: str) -> bool:
        try:
            stats_key = f"{self.stats_key}:{stat_type}"
            await redis_client.incr(stats_key)
            await redis_client.set(stats_key, await redis_client.get(stats_key), ex=7*24*60*60)
            return True
        except Exception as e:
            logger.error(f"Error updating stats: {e}")
            return False
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        try:
            cache_keys = await redis_client.keys("code_cache:*")
            actual_cache_keys = [k for k in cache_keys if not k.endswith(":usage")]
            
            hits = await redis_client.get(f"{self.stats_key}:hits") or "0"
            misses = await redis_client.get(f"{self.stats_key}:misses") or "0"
            cached = await redis_client.get(f"{self.stats_key}:cached") or "0"
            errors = await redis_client.get(f"{self.stats_key}:errors") or "0"
            
            hits = int(hits)
            misses = int(misses)
            cached = int(cached)
            errors = int(errors)
            
            total_requests = hits + misses
            hit_rate = (hits / total_requests * 100) if total_requests > 0 else 0
            
            most_used = []
            sample_keys = actual_cache_keys[:10]
            
            for cache_key in sample_keys:
                try:
                    cached_data = await redis_client.get(cache_key)
                    usage_count = await redis_client.get(f"{cache_key}:usage") or "0"
                    
                    if cached_data:
                        data = json.loads(cached_data)
                        most_used.append({
                            "code_hash": cache_key.split(":")[-1][:12] + "...",
                            "language": data.get("language", "unknown"),
                            "usage_count": int(usage_count),
                            "created_at": data.get("created_at", "unknown")
                        })
                except Exception as e:
                    logger.error(f"Error processing key {cache_key}: {e}")
                    continue
            
            most_used.sort(key=lambda x: x["usage_count"], reverse=True)
            most_used = most_used[:5]
            
            return {
                "active_entries": len(actual_cache_keys),
                "total_requests": total_requests,
                "cache_hits": hits,
                "cache_misses": misses,
                "hit_rate_percent": round(hit_rate, 2),
                "entries_cached": cached,
                "cache_errors": errors,
                "most_used_entries": most_used,
                "cache_ttl_days": self.cache_ttl_seconds // (24 * 60 * 60)
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {
                "active_entries": 0,
                "total_requests": 0,
                "cache_hits": 0,
                "cache_misses": 0,
                "hit_rate_percent": 0,
                "entries_cached": 0,
                "cache_errors": 0,
                "most_used_entries": [],
                "cache_ttl_days": 30
            }
    
    async def clear_cache(self) -> int:
        try:
            cache_keys = await redis_client.keys("code_cache:*")
            usage_keys = await redis_client.keys("cache:*")
            
            deleted_count = 0
            
            for key in cache_keys + usage_keys:
                if await redis_client.delete(key):
                    deleted_count += 1
            
            logger.info(f"Cleared {deleted_count} cache entries")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return 0
    
    async def cleanup_expired_cache(self) -> int:
        logger.info("Redis handles TTL automatically, no manual cleanup needed")
        return 0


cache_service = CodeCacheService()