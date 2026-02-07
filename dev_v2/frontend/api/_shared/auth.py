"""JWT verification for Supabase auth tokens."""

import json
import os
import urllib.request

import jwt


SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")

_jwks_cache: dict | None = None


def _get_jwks() -> dict:
    """Fetch JWKS from Supabase for ES256 verification."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL not configured for JWKS fetch")

    url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    with urllib.request.urlopen(url, timeout=10) as resp:
        _jwks_cache = json.loads(resp.read())
    return _jwks_cache


def _get_signing_key(token: str):
    """Get the correct key for verifying the token."""
    header = jwt.get_unverified_header(token)
    alg = header.get("alg", "")

    if alg.startswith("HS"):
        return SUPABASE_JWT_SECRET, ["HS256", "HS384", "HS512"]

    if alg == "ES256":
        jwks_data = _get_jwks()
        jwks_client = jwt.PyJWKSet.from_dict(jwks_data)
        kid = header.get("kid")
        for key in jwks_client.keys:
            if key.key_id == kid:
                return key.key, ["ES256"]
        raise ValueError("No matching key found in JWKS")

    raise ValueError(f"Unsupported JWT algorithm: {alg}")


def verify_token(authorization: str | None) -> dict:
    """Verify a Supabase JWT and return the payload."""
    if not authorization or not authorization.startswith("Bearer "):
        raise ValueError("Missing or invalid Authorization header")

    token = authorization[7:]

    try:
        key, algorithms = _get_signing_key(token)
        payload = jwt.decode(
            token,
            key,
            algorithms=algorithms,
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid token: {e}")
