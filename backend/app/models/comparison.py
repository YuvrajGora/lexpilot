from typing import List, Literal, Optional
from pydantic import BaseModel, Field, model_validator
from .evidence import SourceEvidence

ChangeType = Literal["modified", "added", "removed"]
CategoryType = Literal[
    "financial",
    "dates",
    "termination",
    "obligations",
    "restrictions",
    "liability",
    "dispute_resolution",
    "access",
    "notices",
    "other",
]

class DocumentMetadata(BaseModel):
    title: str = Field(description="Identified title or descriptor of the agreement, e.g. 'Standard Residential Lease'")
    document_type: str = Field(description="Identified document type, e.g. 'Lease Agreement', 'Non-Disclosure Agreement'")

class DocumentSide(BaseModel):
    text: str = Field(description="Plain-language statement of the clause or 'Not found in Document A.' / 'Not found in Document B.'")
    source: str = Field(description="Direct clause quote from the document or 'Not found in Document A.' / 'Not found in Document B.'")
    evidence: Optional[SourceEvidence] = Field(
        default=None,
        description="Structured source evidence for this document side"
    )

    @model_validator(mode="after")
    def sync_evidence(self) -> "DocumentSide":
        if self.evidence and not self.source:
            self.source = self.evidence.source_text or "Not found in document."
        elif not self.evidence and self.source:
            is_absent = "not found in document" in self.source.lower() or "not found in document" in self.text.lower()
            self.evidence = SourceEvidence(
                source_text=None if is_absent else self.source,
                evidence_status="not_specified" if is_absent else "directly_stated"
            )
        return self


class ChangeItem(BaseModel):
    category: CategoryType = Field(
        description="Category of the difference: financial, dates, termination, obligations, restrictions, liability, dispute_resolution, access, notices, other"
    )
    title: str = Field(description="Short descriptive title of the provision (e.g. 'Monthly Rent', 'Governing Law', 'Audit Rights')")
    change_type: ChangeType = Field(description="Classification: 'modified', 'added', or 'removed'")
    document_a: DocumentSide = Field(description="Provision text and quotation from Document A")
    document_b: DocumentSide = Field(description="Provision text and quotation from Document B")
    explanation: str = Field(description="Objective, plain-language explanation of what differs between Document A and Document B")

class ComparisonResult(BaseModel):
    document_a: DocumentMetadata = Field(description="Metadata for Document A")
    document_b: DocumentMetadata = Field(description="Metadata for Document B")
    summary: str = Field(description="Neutral, document-grounded executive summary highlighting major differences")
    changes: List[ChangeItem] = Field(default_factory=list, description="Meaningful differences found between Document A and Document B")
