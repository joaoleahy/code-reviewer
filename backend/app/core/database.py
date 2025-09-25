from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime, timedelta
from .config import settings

mongo_client = None
database = None
cleanup_task = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global mongo_client, database, cleanup_task
    try:
        mongo_client = AsyncIOMotorClient(settings.MONGODB_URI)
        database = mongo_client[settings.DATABASE_NAME]
        
        await create_indexes()
        
        cleanup_task = asyncio.create_task(periodic_cache_cleanup())

        print("Connected to MongoDB successfully!")
        print("Started periodic cache cleanup task")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e


async def close_mongo_connection():
    """Close connection to MongoDB"""
    global mongo_client, cleanup_task
    if cleanup_task:
        cleanup_task.cancel()
        print("Cache cleanup task cancelled")
    if mongo_client:
        mongo_client.close()
        print("Connection to MongoDB closed!")


async def periodic_cache_cleanup():
    """Periodically cleanup old cache entries"""
    while True:
        try:
            await asyncio.sleep(3600)
            
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            result = await database.code_cache.delete_many({
                "created_at": {"$lt": cutoff_date}
            })
            
            if result.deleted_count > 0:
                print(f"Cleaned up {result.deleted_count} old cache entries")
            
        except asyncio.CancelledError:
            print("Cache cleanup task was cancelled")
            break
        except Exception as e:
            print(f"Error during cache cleanup: {e}")


async def create_indexes():
    """Create indexes to optimize queries"""
    try:
        await database.reviews.create_index([("created_at", -1)])
        await database.reviews.create_index([("language", 1)])
        await database.reviews.create_index([("status", 1)])
        await database.reviews.create_index([("ip_address", 1), ("created_at", -1)])
        
        await database.rate_limits.create_index([("ip_address", 1)])
        await database.rate_limits.create_index([("timestamp", 1)], expireAfterSeconds=3600)
        
        await database.code_cache.create_index([("code_hash", 1)], unique=True)
        await database.code_cache.create_index([("created_at", 1)])
        await database.code_cache.create_index([("last_accessed", 1)])

        print("Indexes created successfully!")
    except Exception as e:
        print(f"Error creating indexes: {e}")


def get_database():
    """Get database instance"""
    return database
