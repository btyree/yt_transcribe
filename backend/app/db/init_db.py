import asyncio

from app.db.base import Base, engine
# Import models to register them with Base metadata
from app.db.models import *  # noqa: F401,F403


async def init_database() -> None:
    """Initialize the database by creating all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized successfully!")


if __name__ == "__main__":
    asyncio.run(init_database())
