from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator, model_validator
from .evidence import SourceEvidence, EvidenceStatus

class AskRequest(BaseModel):
    document_text: str = Field(..., description="Extracted document text")
    question: str = Field(..., description="Question asked about the document")

    @field_validator("question")
    @classmethod
    def validate_question(cls, v: str) -> str:
        if v is None:
            raise ValueError("Question cannot be empty.")
        stripped = v.strip()
        if not stripped:
            raise ValueError("Question cannot be empty.")
        if len(stripped) > 1000:
            raise ValueError("Question exceeds maximum length limit of 1000 characters.")
        return stripped

    @field_validator("document_text")
    @classmethod
    def validate_document_text(cls, v: str) -> str:
        if v is None:
            raise ValueError("Document text cannot be empty.")
        stripped = v.strip()
        if not stripped:
            raise ValueError("Document text cannot be empty.")
        return stripped


class QAResponse(BaseModel):
    answer: str = Field(description="Direct, document-grounded answer in plain language")
    grounded: bool = Field(description="True if the answer is directly supported by the document text, False if unsupported or unmentioned")
    source_text: Optional[str] = Field(default=None, description="Direct verbatim excerpt from the document providing source evidence")
    source_location: Optional[str] = Field(default=None, description="Section, clause, or page reference if reliably determined, otherwise null or 'Unavailable'")
    confidence: Literal["document_supported", "not_specified", "insufficient_information"] = Field(
        default="document_supported",
        description="Confidence status based strictly on document presence"
    )
    evidence: Optional[SourceEvidence] = Field(
        default=None,
        description="Structured source evidence object with status, exact text, section, location, and document identifier"
    )

    @model_validator(mode="after")
    def validate_grounded_source(self) -> "QAResponse":
        # Synchronize from evidence if provided
        if self.evidence:
            if not self.source_text and self.evidence.source_text:
                self.source_text = self.evidence.source_text
            if not self.source_location and self.evidence.location:
                self.source_location = self.evidence.location
            if self.evidence.evidence_status == "directly_stated":
                self.grounded = True
                self.confidence = "document_supported"
            elif self.evidence.evidence_status == "not_specified":
                self.grounded = False
                self.confidence = "not_specified"
            elif self.evidence.evidence_status == "insufficient_evidence":
                self.grounded = False
                self.confidence = "insufficient_information"

        # Evidence consistency rule
        if self.grounded and self.confidence == "document_supported":
            if not self.source_text or not self.source_text.strip():
                raise ValueError("Missing source evidence: Factual document-supported answers must include source_text.")

        # Ensure self.evidence is always populated
        if not self.evidence:
            status_map = {
                "document_supported": "directly_stated",
                "not_specified": "not_specified",
                "insufficient_information": "insufficient_evidence",
            }
            ev_status: EvidenceStatus = status_map.get(self.confidence, "directly_stated" if self.grounded else "not_specified")
            self.evidence = SourceEvidence(
                source_text=self.source_text,
                location=self.source_location,
                evidence_status=ev_status,
            )
        return self

