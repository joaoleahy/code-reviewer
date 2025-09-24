from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

mongo_client: AsyncIOMotorClient = None
database = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global mongo_client, database
    try:
        mongo_client = AsyncIOMotorClient(settings.MONGODB_URI)
        database = mongo_client[settings.DATABASE_NAME]
        
        await create_indexes()

        print("Connected to MongoDB successfully!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e


async def close_mongo_connection():
    """Close connection to MongoDB"""
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("Connection to MongoDB closed!")


async def create_indexes():
    """Create indexes to optimize queries"""
    try:
        await database.reviews.create_index([("created_at", -1)])
        await database.reviews.create_index([("language", 1)])
        await database.reviews.create_index([("status", 1)])
        await database.reviews.create_index([("ip_address", 1), ("created_at", -1)])

        print("Indexes created successfully!")
    except Exception as e:
        print(f"Error creating indexes: {e}")


def get_database():
    """Get database instance"""
    return database
