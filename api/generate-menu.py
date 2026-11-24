"""POST /api/generate-menu — Generate a new weekly menu book."""

import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

from _shared.endpoint import check_preferences, handle_post
from _shared.menu_service import get_menu_service


def generate_menu(body: dict) -> dict:
    return get_menu_service().generate(check_preferences(body))


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        handle_post(self, generate_menu)
