"""
OMenu Backend - FastAPI Application

This is the main entry point for the OMenu backend API.
The backend is a stateless AI generation service using Google Gemini.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, meal_plans, shopping

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    settings = get_settings()
    logger.info(f"Starting OMenu Backend (debug={settings.debug})")
    logger.info(f"CORS origins: {settings.cors_origins_list}")
    
    # Startup: verify Gemini API key is set
    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY not set! API calls will fail.")
    else:
        logger.info("Gemini API key configured")
    
    yield
    
    # Shutdown
    logger.info("Shutting down OMenu Backend")


# Create FastAPI app
app = FastAPI(
    title="OMenu API",
    description="AI-powered meal planning backend using Google Gemini",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, prefix="/api")
app.include_router(meal_plans.router, prefix="/api")
app.include_router(shopping.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint - redirect to docs."""
    return {
        "message": "OMenu API",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
