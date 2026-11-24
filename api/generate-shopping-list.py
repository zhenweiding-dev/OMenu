"""POST /api/generate-shopping-list — Generate a shopping list from menus."""

import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

from _shared.endpoint import check_menus, handle_post, require_string
from _shared.shopping_service import get_shopping_service


def generate_shopping_list(body: dict) -> dict:
    menu_book_id = require_string(body.get("menuBookId"), "menuBookId")
    menus = check_menus(body.get("menus"))
    return get_shopping_service().generate(menu_book_id, menus)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        handle_post(self, generate_shopping_list)
