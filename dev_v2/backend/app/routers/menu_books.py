"""Menu Books API routes - CRUD operations for weekly meal plans."""
from typing import List

from fastapi import APIRouter, HTTPException

from app.models.schemas import MenuBook, ShoppingList
from app.storage import (
    delete_menu_book,
    load_all_menu_books,
    load_menu_book,
    save_menu_book,
)

router = APIRouter()


@router.get("", response_model=List[MenuBook])
async def list_menu_books() -> List[MenuBook]:
    """Get all menu books, sorted by creation date (newest first)."""
    return load_all_menu_books()


@router.post("", response_model=MenuBook, status_code=201)
async def create_menu_book(book: MenuBook) -> MenuBook:
    """Create a new menu book."""
    existing = load_menu_book(book.id)
    if existing:
        raise HTTPException(status_code=409, detail=f"Menu book with id '{book.id}' already exists")
    save_menu_book(book)
    return book


@router.get("/{book_id}", response_model=MenuBook)
async def get_menu_book(book_id: str) -> MenuBook:
    """Get a specific menu book by ID."""
    book = load_menu_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail=f"Menu book '{book_id}' not found")
    return book


@router.put("/{book_id}", response_model=MenuBook)
async def update_menu_book(book_id: str, book: MenuBook) -> MenuBook:
    """Update an existing menu book."""
    existing = load_menu_book(book_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Menu book '{book_id}' not found")
    # Ensure ID matches
    if book.id != book_id:
        book.id = book_id
    save_menu_book(book)
    return book


@router.delete("/{book_id}", status_code=204)
async def remove_menu_book(book_id: str) -> None:
    """Delete a menu book."""
    deleted = delete_menu_book(book_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Menu book '{book_id}' not found")


@router.put("/{book_id}/shopping-list", response_model=MenuBook)
async def update_shopping_list(book_id: str, shopping_list: ShoppingList) -> MenuBook:
    """Update the shopping list for a menu book."""
    book = load_menu_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail=f"Menu book '{book_id}' not found")
    
    # Update shopping list
    book.shoppingList = shopping_list
    save_menu_book(book)
    return book
