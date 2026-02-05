"""Main API router aggregating all endpoints."""

from fastapi import APIRouter

from app.api.v1 import menu_books, shopping, user_state

api_router = APIRouter(prefix="/api")

# Include v1 routers
api_router.include_router(
    menu_books.router, prefix="/menu-books", tags=["Menu Books"]
)
api_router.include_router(
    shopping.router, prefix="/shopping-lists", tags=["Shopping Lists"]
)
api_router.include_router(
    user_state.router, prefix="/user-state", tags=["User State"]
)
