import redis.asyncio as redis
import json
import httpx
from typing import Optional, Any
from .config import settings


class RedisClient:
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.is_upstash = False
        
    async def connect(self):
        """Connect to Redis - local or Upstash based on environment"""
        try:
            if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN:
                print("Connecting to Upstash Redis...")
                self.is_upstash = True
                self.upstash_url = settings.UPSTASH_REDIS_REST_URL
                self.upstash_token = settings.UPSTASH_REDIS_REST_TOKEN
                print("Connected to Upstash Redis successfully!")
                
            else:
                print("Connecting to local Redis...")
                self.is_upstash = False
                
                if settings.REDIS_PASSWORD:
                    self.client = redis.from_url(
                        f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}",
                        decode_responses=True,
                        socket_connect_timeout=5,
                        socket_timeout=5
                    )
                else:
                    self.client = redis.Redis(
                        host=settings.REDIS_HOST,
                        port=settings.REDIS_PORT,
                        decode_responses=True,
                        socket_connect_timeout=5,
                        socket_timeout=5
                    )
                
                await self.client.ping()
                print("Connected to local Redis successfully!")
                
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            raise
    
    async def close(self):
        """Close Redis connection"""
        if self.client and not self.is_upstash:
            await self.client.close()
            print("Redis connection closed")
    
    async def _upstash_request(self, command: str, *args) -> Any:
        """Make HTTP request to Upstash Redis REST API"""
        url = f"{self.upstash_url}/{command}"
        
        headers = {
            "Authorization": f"Bearer {self.upstash_token}",
            "Content-Type": "application/json"
        }
        
        body = list(args) if args else []
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=body, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            return data.get("result")
    
    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis"""
        try:
            if self.is_upstash:
                return await self._upstash_request("get", key)
            else:
                return await self.client.get(key)
        except Exception as e:
            print(f"Redis GET error: {e}")
            return None
    
    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Set value in Redis with optional expiration"""
        try:
            if self.is_upstash:
                if ex:
                    await self._upstash_request("setex", key, ex, value)
                else:
                    await self._upstash_request("set", key, value)
                return True
            else:
                return await self.client.set(key, value, ex=ex)
        except Exception as e:
            print(f"Redis SET error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from Redis"""
        try:
            if self.is_upstash:
                result = await self._upstash_request("del", key)
                return result == 1
            else:
                result = await self.client.delete(key)
                return result == 1
        except Exception as e:
            print(f"Redis DELETE error: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis"""
        try:
            if self.is_upstash:
                result = await self._upstash_request("exists", key)
                return result == 1
            else:
                return await self.client.exists(key) == 1
        except Exception as e:
            print(f"Redis EXISTS error: {e}")
            return False
    
    async def incr(self, key: str) -> int:
        """Increment value in Redis"""
        try:
            if self.is_upstash:
                return await self._upstash_request("incr", key)
            else:
                return await self.client.incr(key)
        except Exception as e:
            print(f"Redis INCR error: {e}")
            return 0
    
    async def ttl(self, key: str) -> int:
        """Get TTL of key"""
        try:
            if self.is_upstash:
                return await self._upstash_request("ttl", key)
            else:
                return await self.client.ttl(key)
        except Exception as e:
            print(f"Redis TTL error: {e}")
            return -1
    
    async def keys(self, pattern: str = "*") -> list:
        """Get keys matching pattern (use with caution in production)"""
        try:
            if self.is_upstash:
                result = await self._upstash_request("keys", pattern)
                return result or []
            else:
                return await self.client.keys(pattern)
        except Exception as e:
            print(f"Redis KEYS error: {e}")
            return []


redis_client = RedisClient()