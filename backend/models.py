from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Request model for incoming verification requests
class ClaimRequest(BaseModel):
    claim_text: str

# Model for individual source items
class Source(BaseModel):
    name: str
    url: str
    snippet: Optional[str] = None

# Response model for the verification result
class VerificationResponse(BaseModel):
    verdict: str
    explanation: str
    sources: List[Source]
    credibility_score: int
    hash: str
    created_at: str

# Model for retrieving archived items
class ArchiveItem(BaseModel):
    id: int
    claim_text: str
    verdict: str
    explanation: str
    sources: List[Source]
    credibility_score: int
    hash: str
    created_at: str