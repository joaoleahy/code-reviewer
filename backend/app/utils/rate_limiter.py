from datetime import datetime, timedelta
from typing import Dict
import asyncio

from ..core.config import settings
from ..core.database import get_database


class RateLimiter:
    def __init__(self):
        self._cache: Dict[str, list] = {}
        self._lock = asyncio.Lock()
    
    async def check_rate_limit(self, ip_address: str) -> bool:
        """
        Check if IP is within rate limit
        Returns True if allowed, False if exceeded
        """
        try:
            async with self._lock:
                now = datetime.utcnow()
                hour_ago = now - timedelta(hours=1)
                
                if ip_address in self._cache:
                    self._cache[ip_address] = [
                        request_time for request_time in self._cache[ip_address]
                        if request_time > hour_ago
                    ]
                else:
                    self._cache[ip_address] = []
                
                current_requests = len(self._cache[ip_address])
                
                if current_requests >= settings.RATE_LIMIT_PER_HOUR:
                    return False
                
                self._cache[ip_address].append(now)
                
                await self._log_request(ip_address, now)
                
                return True
                
        except Exception as e:
            print(f"Rate limiter error: {e}")
            return True
    
    async def _log_request(self, ip_address: str, timestamp: datetime):
        """
        Log request to MongoDB for analytics
        """
        try:
            db = get_database()
            if db is None:
                return
                
            await db.rate_limit_logs.insert_one({
                "ip_address": ip_address,
                "timestamp": timestamp,
                "created_at": timestamp
            })
            
            week_ago = timestamp - timedelta(days=7)
            await db.rate_limit_logs.delete_many({
                "timestamp": {"$lt": week_ago}
            })
            
        except Exception as e:
            print(f"Error logging request: {e}")
    
    async def get_remaining_requests(self, ip_address: str) -> int:
        """
        Get remaining requests count for IP
        """
        try:
            async with self._lock:
                now = datetime.utcnow()
                hour_ago = now - timedelta(hours=1)
                
                if ip_address not in self._cache:
                    return settings.RATE_LIMIT_PER_HOUR
                
                valid_requests = [
                    req for req in self._cache[ip_address]
                    if req > hour_ago
                ]
                
                remaining = settings.RATE_LIMIT_PER_HOUR - len(valid_requests)
                return max(0, remaining)
                
        except Exception as e:
            print(f"Error getting remaining requests: {e}")
            return settings.RATE_LIMIT_PER_HOUR


rate_limiter = RateLimiter()


async def check_rate_limit(ip_address: str) -> bool:
    """
    Convenience function to check rate limit
    """
    return await rate_limiter.check_rate_limit(ip_address)
