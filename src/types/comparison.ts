import { SourceEvidence } from './evidence';

export type ChangeType = 'modified' | 'added' | 'removed';

export type CategoryType =
  | 'financial'
  | 'dates'
  | 'termination'
  | 'obligations'
  | 'restrictions'
  | 'liability'
  | 'dispute_resolution'
  | 'access'
  | 'notices'
  | 'other';

export interface DocumentMetadata {
  title: string;
  document_type: string;
}

export interface DocumentSide {
  text: string;
  source: string;
  evidence?: SourceEvidence;
}

export interface ChangeItem {
  category: CategoryType;
  title: string;
  change_type: ChangeType;
  document_a: DocumentSide;
  document_b: DocumentSide;
  explanation: string;
}

export interface ComparisonResult {
  document_a: DocumentMetadata;
  document_b: DocumentMetadata;
  summary: string;
  changes: ChangeItem[];
}

export type ComparisonStatus = 'idle' | 'reading' | 'comparing' | 'success' | 'error';
