export type EvidenceStatus = 'directly_stated' | 'not_specified' | 'insufficient_evidence';

export interface SourceEvidence {
  source_text?: string | null;
  section?: string | null;
  location?: string | null;
  document?: string | null;
  evidence_status: EvidenceStatus;
}
