"""Client for the ABDM Wrapper (Java). All ABDM gateway calls go through here.
Never call the ABDM gateway directly. See the project-architecture skill."""
import httpx

from app.core.config import settings


class WrapperClient:
    def __init__(self, base_url: str | None = None):
        self.base_url = base_url or settings.abdm_wrapper_url

    async def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(base_url=self.base_url, timeout=30)

    # TODO (M4): create/verify ABHA, scan & share, discovery.
    # TODO (M8): care contexts, consent, encrypted exchange, callbacks.
