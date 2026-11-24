"""GET /api/keepalive — daily database read so the free Supabase project is not paused.

Supabase pauses Free-plan projects that get little database activity over 7 days.
Vercel Cron (the "crons" entry in vercel.json) calls this endpoint once a day; it
reads one row from each app table through the Supabase REST API with the public
key. Row Level Security returns no rows to this anonymous request, but each read
still runs a query in the database.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "")
TABLES = ("profiles", "menu_books")


def read_table(table: str) -> dict:
    request = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{table}?select=id&limit=1",
        headers={"apikey": SUPABASE_KEY},
    )
    started = time.monotonic()
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            status = response.status
    except urllib.error.HTTPError as exc:
        status = exc.code
    except Exception as exc:
        print(f"[keepalive] {table}: {type(exc).__name__}: {exc}", file=sys.stderr, flush=True)
        status = None
    return {"table": table, "status": status, "ms": round((time.monotonic() - started) * 1000)}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if not SUPABASE_URL or not SUPABASE_KEY:
            self._send(500, {"ok": False, "message": "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set."})
            return
        results = [read_table(table) for table in TABLES]
        ok = all(result["status"] == 200 for result in results)
        print(f"[keepalive] ok={ok} {results}", file=sys.stderr, flush=True)
        self._send(200 if ok else 502, {"ok": ok, "reads": results})

    def _send(self, status: int, payload: dict) -> None:
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
