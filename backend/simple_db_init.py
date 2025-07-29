"""
Simple database initialization - no migrations needed for personal use.
Just run this once to create tables.
"""
import asyncio

from sqlalchemy.ext.asyncio import create_async_engine

from app.db.base import Base


async def init_db():
    """Create all database tables."""
    engine = create_async_engine("sqlite+aiosqlite:///./yt_transcribe.db")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Database tables created!")


if __name__ == "__main__":
    asyncio.run(init_db())
