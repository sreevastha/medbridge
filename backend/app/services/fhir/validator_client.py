"""Client for the HAPI FHIR validator (Java). Validate every bundle against the
NRCeS India profiles before anything goes to ABDM (M7.3)."""
import httpx

from app.core.config import settings


async def validate_bundle(bundle: dict) -> dict:
    async with httpx.AsyncClient(base_url=settings.hapi_validator_url, timeout=30) as c:
        # TODO (M7.3): POST to the validator's $validate endpoint and parse the result.
        raise NotImplementedError
