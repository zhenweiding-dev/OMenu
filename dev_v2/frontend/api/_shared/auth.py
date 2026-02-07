"""JWT verification for Supabase auth tokens."""

import os
import jwt


SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")


def verify_token(authorization: str | None) -> dict:
    """Verify a Supabase JWT and return the payload.

    Args:
        authorization: The Authorization header value (Bearer <token>).

    Returns:
        Decoded JWT payload with user info.

    Raises:
        ValueError: If the token is missing or invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise ValueError("Missing or invalid Authorization header")

    token = authorization[7:]

    if not SUPABASE_JWT_SECRET:
        raise ValueError("SUPABASE_JWT_SECRET not configured")

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid token: {e}")
