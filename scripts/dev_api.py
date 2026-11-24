"""Serve the Vercel Python functions in api/ on localhost for `npm run dev`.

Vite proxies /api/* to this server (see vite.config.ts), so local runs use the
same handlers, prompts and Gemini client as production. Environment variables
come from the shell first, then from .env.local and .env in the repository root.

    python scripts/dev_api.py        # listens on http://127.0.0.1:8000
"""

import importlib.util
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
API_DIR = ROOT_DIR / "api"
PORT = int(os.environ.get("DEV_API_PORT", "8000"))


def load_env_file(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def load_routes() -> dict:
    """Map /api/<file name> to the `handler` class of each api/*.py file."""
    sys.path.insert(0, str(API_DIR))
    routes = {}
    for file in sorted(API_DIR.glob("*.py")):
        spec = importlib.util.spec_from_file_location(f"api_{file.stem.replace('-', '_')}", file)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        routes[f"/api/{file.stem}"] = module.handler
    return routes


class Router(BaseHTTPRequestHandler):
    routes: dict = {}

    def do_POST(self):
        target = self.routes.get(self.path.split("?", 1)[0])
        if target is None:
            self.send_error(404, "No such API function")
            return
        # Each api/*.py handler only defines do_POST, so it can run on this request object.
        target.do_POST(self)


def main() -> None:
    # Load env before importing the handlers: they read their settings at import time.
    load_env_file(ROOT_DIR / ".env.local")
    load_env_file(ROOT_DIR / ".env")
    Router.routes = load_routes()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Router)
    print(f"API functions on http://127.0.0.1:{PORT}: {', '.join(Router.routes)}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
