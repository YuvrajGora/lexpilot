import { SourceEvidence } from './evidence';

export type QAConfidence = 'document_supported' | 'not_specified' | 'insufficient_information';

export interface QAResponse {
  answer: string;
  grounded: boolean;
  source_text: string | null;
  source_location: string | null;
  confidence: QAConfidence;
  evidence?: SourceEvidence | null;
}

export interface AskRequest {
  document_text: string;
  question: string;
}
