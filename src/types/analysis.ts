import { SourceEvidence } from './evidence';

export interface Party {
  name: string;
  role: string;
  source_text?: string;
  evidence?: SourceEvidence;
}

export interface ImportantDate {
  date: string;
  description: string;
  source_text?: string;
  evidence?: SourceEvidence;
}

export interface FinancialObligation {
  description: string;
  amount: string;
  frequency: string;
  source_text: string;
  evidence?: SourceEvidence;
}

export interface KeyObligation {
  party: string;
  obligation: string;
  source_text: string;
  evidence?: SourceEvidence;
}

export interface TerminationClause {
  summary: string;
  notice_period: string;
  conditions: string[];
  source_text: string;
  evidence?: SourceEvidence;
}

export interface AttentionItem {
  title: string;
  severity: string; // "attention" | "worth reviewing"
  explanation: string;
  source_text: string;
  evidence?: SourceEvidence;
}

export interface AnalysisResult {
  document_type: string;
  summary: string;
  parties: Party[];
  important_dates: ImportantDate[];
  financial_obligations: FinancialObligation[];
  key_obligations: KeyObligation[];
  termination: TerminationClause;
  attention_items: AttentionItem[];
  extracted_text?: string;
}

export type ProcessingStatus = 
  | 'idle'
  | 'selected'
  | 'reading'
  | 'analyzing'
  | 'success'
  | 'error';

export interface DocumentInfo {
  file: File;
  name: string;
  size: number;
  type: string;
}
