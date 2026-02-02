from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import meal_plans, shopping, user_state

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

app.include_router(meal_plans.router, prefix="/api/meal-plans", tags=["Meal Plans"])
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
