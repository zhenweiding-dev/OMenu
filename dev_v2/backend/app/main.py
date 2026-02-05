from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import menu_books, shopping, user_state

app = FastAPI(
    title="OMenu API",
    description="AI-powered menu planning backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTE: menu_books router was previously meal_plans; renamed to match MenuBook terminology.
app.include_router(menu_books.router, prefix="/api/menu-books", tags=["Menu Books"])
app.include_router(shopping.router, prefix="/api/shopping-lists", tags=["Shopping Lists"])
app.include_router(user_state.router, prefix="/api/user-state", tags=["User State"])


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """Return basic service status metadata."""

    return {
        "status": "ok",
        "version": app.version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
