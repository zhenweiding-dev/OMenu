"""POST /api/generate-shopping-list — Generate a shopping list from menus."""

import json
from http.server import BaseHTTPRequestHandler

from _shared.auth import verify_token
from _shared.exceptions import AppException
from _shared.shopping_service import get_shopping_service


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Verify auth
            auth_header = self.headers.get("Authorization")
            verify_token(auth_header)

            # Parse body
            content_length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(content_length))

            menu_book_id = body.get("menuBookId", "")
            menus = body.get("menus", {})

            if not menu_book_id or not menus:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"code": "VALIDATION_ERROR", "message": "menuBookId and menus are required"}).encode())
                return

            # Generate shopping list
            service = get_shopping_service()
            result = service.generate(menu_book_id, menus)

            # Return response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except ValueError as e:
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"code": "UNAUTHORIZED", "message": str(e)}).encode())

        except AppException as e:
            self.send_response(e.status_code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(e.to_dict()).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"code": "INTERNAL_ERROR", "message": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
