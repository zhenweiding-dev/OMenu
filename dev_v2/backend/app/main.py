from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    draft,
    meal_plans,
    menu_books,
    menu_extras,
    profile,
    shopping,
    ui_state,
)

app = FastAPI(
    title="OMenu API",
    description="AI-powered meal planning backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Generation endpoints
app.include_router(meal_plans.router, prefix="/api/meal-plans", tags=["Meal Plans"])
app.include_router(shopping.router, prefix="/api/shopping-lists", tags=["Shopping Lists"])

# Separated data storage endpoints
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(menu_books.router, prefix="/api/menu-books", tags=["Menu Books"])
app.include_router(ui_state.router, prefix="/api/ui-state", tags=["UI State"])
app.include_router(draft.router, prefix="/api/draft", tags=["Draft"])
app.include_router(menu_extras.router, prefix="/api/menu-extras", tags=["Menu Extras"])


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """Return basic service status metadata."""

    return {
        "status": "ok",
        "version": app.version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
