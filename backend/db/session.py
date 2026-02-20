from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=True,
    pool_pre_ping=True,      # Check connection health before using
    pool_recycle=3600,       # Recycle connections after an hour
    pool_size=5,             # Keep the pool size reasonable
    max_overflow=10
)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
