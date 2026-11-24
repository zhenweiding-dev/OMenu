"""JWT verification for Supabase auth tokens."""

import json
import os
import sys
import urllib.request

import jwt

from _shared.exceptions import AppException, AuthError


SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")

_jwks_cache: dict | None = None


def _get_jwks() -> dict:
    """Fetch the project's public signing keys (ES256) once per function instance."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    if not SUPABASE_URL:
        raise AppException(
            "VITE_SUPABASE_URL is not set on the server, so sign-in tokens cannot be verified.",
            code="CONFIG_ERROR",
        )

    url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            _jwks_cache = json.loads(resp.read())
    except (OSError, ValueError) as exc:
        print(f"[auth] JWKS fetch from {url} failed: {exc}", file=sys.stderr, flush=True)
        raise AppException(
            "Could not reach Supabase to verify the sign-in token.",
            code="AUTH_UNAVAILABLE",
            status_code=503,
        ) from exc
    return _jwks_cache


def _get_signing_key(token: str):
    """Get the correct key for verifying the token."""
    header = jwt.get_unverified_header(token)
    alg = header.get("alg", "")

    if alg.startswith("HS"):
        if not SUPABASE_JWT_SECRET:
            raise AuthError("Token is signed with HS256, but SUPABASE_JWT_SECRET is not set on the server.")
        return SUPABASE_JWT_SECRET, ["HS256", "HS384", "HS512"]

    if alg == "ES256":
        jwks_data = _get_jwks()
        jwks_client = jwt.PyJWKSet.from_dict(jwks_data)
        kid = header.get("kid")
        for key in jwks_client.keys:
            if key.key_id == kid:
                return key.key, ["ES256"]
        raise AuthError("Token signing key not found in Supabase JWKS.")

    raise AuthError(f"Unsupported JWT algorithm: {alg}")


def verify_token(authorization: str | None) -> dict:
    """Verify a Supabase JWT and return the payload."""
    if not authorization or not authorization.startswith("Bearer "):
        raise AuthError("Missing or invalid Authorization header.")

    token = authorization[7:]

    try:
        key, algorithms = _get_signing_key(token)
        return jwt.decode(
            token,
            key,
            algorithms=algorithms,
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise AuthError("Your sign-in has expired. Please sign in again.")
    except jwt.PyJWTError as exc:
        raise AuthError(f"Invalid token: {exc}")
