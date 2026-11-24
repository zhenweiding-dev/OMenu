"""POST /api/modify-menu — Modify an existing menu book."""

import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

from _shared.endpoint import check_menus, check_modification, check_preferences, handle_post, require_string
from _shared.exceptions import ValidationError
from _shared.menu_service import get_menu_service


def modify_menu(body: dict) -> dict:
    book_id = require_string(body.get("bookId"), "bookId")
    modification = check_modification(body.get("modification"))
    book = body.get("currentMenuBook")
    if not isinstance(book, dict):
        raise ValidationError("currentMenuBook is required.")
    check_preferences(book.get("preferences"))
    check_menus(book.get("menus"))
    return get_menu_service().modify(book_id, modification, book)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        handle_post(self, modify_menu)
