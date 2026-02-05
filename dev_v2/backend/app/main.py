"""OMenu API - AI-powered menu planning backend."""

from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import configure_logging, settings

# Configure logging
configure_logging()

# Create FastAPI application
app = FastAPI(
    title="OMenu API",
    description="AI-powered menu planning backend",
    version="1.0.0",
    debug=settings.debug,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """Return basic service status metadata."""
    return {
        "status": "ok",
        "version": app.version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
