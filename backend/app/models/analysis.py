from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from .evidence import SourceEvidence

class Party(BaseModel):
    name: str = Field(description="Name of the party or entity")
    role: str = Field(description="Role in the agreement, e.g. Landlord, Tenant, Client, Provider")
    source_text: Optional[str] = Field(default=None, description="Direct clause or excerpt naming this party")
    evidence: Optional[SourceEvidence] = Field(default=None, description="Structured source evidence for party identification")

    @model_validator(mode="after")
    def sync_evidence(self) -> "Party":
        if self.evidence and not self.source_text:
            self.source_text = self.evidence.source_text
        elif self.source_text and not self.evidence:
            is_absent = "not specified" in self.source_text.lower()
            self.evidence = SourceEvidence(
                source_text=self.source_text,
                evidence_status="not_specified" if is_absent else "directly_stated"
            )
        return self

class ImportantDate(BaseModel):
    date: str = Field(description="Date mentioned or deadline")
    description: str = Field(description="Description of the milestone, effective date, or deadline")
    source_text: Optional[str] = Field(default=None, description="Direct clause or sentence excerpt from the document")
    evidence: Optional[SourceEvidence] = Field(default=None, description="Structured source evidence for this date or deadline")

    @model_validator(mode="after")
    def sync_evidence(self) -> "ImportantDate":
        if self.evidence and not self.source_text:
            self.source_text = self.evidence.source_text
        elif self.source_text and not self.evidence:
            is_absent = "not specified" in self.source_text.lower()
            self.evidence = SourceEvidence(
                source_text=self.source_text,
                evidence_status="not_specified" if is_absent else "directly_stated"
            )
        return self

class FinancialObligation(BaseModel):
    description: str = Field(description="Description of payment, fee, deposit, or charge")
    amount: str = Field(description="Monetary amount, fee structure, or 'Not specified in the document.'")
    frequency: str = Field(description="One-time, monthly, annually, upon delivery, etc.")
    source_text: str = Field(description="Direct clause or sentence excerpt from the document")
    evidence: Optional[SourceEvidence] = Field(default=None, description="Structured source evidence for this financial obligation")

    @model_validator(mode="after")
    def sync_evidence(self) -> "FinancialObligation":
        if self.evidence and not self.source_text:
            self.source_text = self.evidence.source_text or "Not specified in the document."
        elif not self.evidence and self.source_text:
            is_absent = "not specified" in self.source_text.lower()
            self.evidence = SourceEvidence(
                source_text=self.source_text,
                evidence_status="not_specified" if is_absent else "directly_stated"
            )
        return self

class KeyObligation(BaseModel):
    party: str = Field(description="Party responsible for this obligation")
    obligation: str = Field(description="Clear explanation of the obligation in plain English")
    source_text: str = Field(description="Direct clause or sentence excerpt from the document")
    evidence: Optional[SourceEvidence] = Field(default=None, description="Structured source evidence for this obligation")

    @model_validator(mode="after")
    def sync_evidence(self) -> "KeyObligation":
        if self.evidence and not self.source_text:
            self.source_text = self.evidence.source_text or "Not specified in the document."
        elif not self.evidence and self.source_text:
            is_absent = "not specified" in self.source_text.lower()
            self.evidence = SourceEvidence(
                source_text=self.source_text,
                evidence_status="not_specified" if is_absent else "directly_stated"
            )
        return self

class TerminationClause(BaseModel):
    summary: str = Field(description="Plain-language summary of how the agreement ends")
    notice_period: str = Field(description="Required notice period, or 'Not specified in the document.'")
    conditions: List[str] = Field(default_factory=list, description="Conditions under which termination may occur")
    source_text: str = Field(description="Direct clause or excerpt regarding termination")
    evidence: Optional[SourceEvidence] = Field(default=None, description="Structured source evidence for termination conditions")

    @model_validator(mode="after")
    def sync_evidence(self) -> "TerminationClause":
        if self.evidence and not self.source_text:
            self.source_text = self.evidence.source_text or "Not specified in the document."
        elif not self.evidence and self.source_text:
            is_absent = "not specified" in self.source_text.lower()
            self.evidence = SourceEvidence(
                source_text=self.source_text,
                evidence_status="not_specified" if is_absent else "directly_stated"
            )
        return self

class AttentionItem(BaseModel):
    title: str = Field(description="Descriptive title of the clause or topic to review")
    severity: str = Field(default="attention", description="Attention level, e.g. 'attention' or 'worth reviewing'")
    explanation: str = Field(description="Objective explanation of why this clause warrants review")
    source_text: str = Field(description="Direct clause or sentence excerpt from the document")
    evidence: Optional[SourceEvidence] = Field(default=None, description="Structured source evidence for this review item")

    @model_validator(mode="after")
    def sync_evidence(self) -> "AttentionItem":
        if self.evidence and not self.source_text:
            self.source_text = self.evidence.source_text or "Not specified in the document."
        elif not self.evidence and self.source_text:
            is_absent = "not specified" in self.source_text.lower()
            self.evidence = SourceEvidence(
                source_text=self.source_text,
                evidence_status="not_specified" if is_absent else "directly_stated"
            )
        return self

class AnalysisResult(BaseModel):
    document_type: str = Field(description="Identified document type (e.g. Non-Disclosure Agreement, Residential Lease Agreement)")
    summary: str = Field(description="Comprehensive high-level summary of the agreement in plain English")
    parties: List[Party] = Field(default_factory=list, description="Parties bound by the document")
    important_dates: List[ImportantDate] = Field(default_factory=list, description="Key dates, deadlines, or durations")
    financial_obligations: List[FinancialObligation] = Field(default_factory=list, description="Financial terms and obligations")
    key_obligations: List[KeyObligation] = Field(default_factory=list, description="Core obligations divided by party")
    termination: TerminationClause = Field(description="Termination terms and exit conditions")
    attention_items: List[AttentionItem] = Field(default_factory=list, description="Specific clauses worthy of user attention")
    extracted_text: Optional[str] = Field(default=None, description="Extracted plain text of the document")

