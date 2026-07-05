"""Shared dependencies (DB session, current user, role guards)."""
from app.core.database import get_db  # noqa: F401

# TODO (M2.2/M2.3): get_current_user and require_role(...) dependencies.
