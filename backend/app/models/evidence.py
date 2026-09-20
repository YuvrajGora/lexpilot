from typing import Optional, Literal
from pydantic import BaseModel, Field

EvidenceStatus = Literal["directly_stated", "not_specified", "insufficient_evidence"]

class SourceEvidence(BaseModel):
    """Consistent structured evidence representation for all extracted and generated claims."""
    source_text: Optional[str] = Field(
        default=None,
        description="Exact verbatim or near-verbatim excerpt from the document providing supporting evidence."
    )
    section: Optional[str] = Field(
        default=None,
        description="Document section name or heading if explicitly written in the text (e.g. 'Rent & Deposit', 'Term and Termination')."
    )
    location: Optional[str] = Field(
        default=None,
        description="Specific clause number or reference if explicitly written (e.g. 'Clause 4.1', 'Section 8(b)'). Never fabricate page coordinates or paragraph numbers."
    )
    document: Optional[str] = Field(
        default=None,
        description="Document identifier or filename (e.g. 'Document A', 'Document B', or document title)."
    )
    evidence_status: EvidenceStatus = Field(
        default="directly_stated",
        description="Grounding status: 'directly_stated' (directly found in document), 'not_specified' (absent), or 'insufficient_evidence' (ambiguous or incomplete)."
    )
