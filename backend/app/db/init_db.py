import asyncio

from app.db.base import Base, engine


async def init_database() -> None:
    """Initialize the database by creating all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized successfully!")


if __name__ == "__main__":
    asyncio.run(init_database())
