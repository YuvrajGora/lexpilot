import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  GitCompare,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { ComparisonStatus } from '../types/comparison';

interface DocumentComparisonWorkspaceProps {
  onCompare: (fileA: File, fileB: File) => Promise<void>;
  status: ComparisonStatus;
  statusMessage?: string;
  errorMessage?: string;
  onReset: () => void;
  onBackToSingleAnalyze?: () => void;
}

const SAMPLE_LEASE_A = `RESIDENTIAL LEASE AGREEMENT (VERSION A)
This Residential Lease Agreement is entered into on November 1, 2026, by and between Oakwood Real Estate LLC (Landlord) and Alex Mercer (Tenant).
1. PREMISES: Apartment 3B, 402 Pine Court.
2. TERM: 12 months commencing November 1, 2026.
3. MONTHLY RENT: Tenant shall pay a monthly rent of INR 28,000 due on the first day of each month.
4. SECURITY DEPOSIT: Tenant shall deposit INR 56,000 as security against physical damage.
5. TERMINATION NOTICE: Either party may terminate this agreement by providing thirty (30) days' prior written notice.
6. LATE FEE: A late fee of INR 500 shall apply if rent is received after the 5th day of the month.
7. GUEST POLICY: Guests may not reside in the premises for longer than 14 consecutive nights without prior written consent from Landlord.
8. MAINTENANCE: Tenant shall keep the apartment in a clean, hygienic, and sanitary condition.`;

const SAMPLE_LEASE_B = `RESIDENTIAL LEASE AGREEMENT (VERSION B)
This Residential Lease Agreement is entered into on November 1, 2026, by and between Oakwood Real Estate LLC (Landlord) and Alex Mercer (Tenant).
1. PREMISES: Apartment 3B, 402 Pine Court.
2. TERM: 12 months commencing November 1, 2026.
3. MONTHLY RENT: Tenant shall pay a monthly rent of INR 31,000 due on the first day of each month.
4. SECURITY DEPOSIT: Tenant shall deposit INR 62,000 as security against physical damage.
5. TERMINATION NOTICE: Either party may terminate this agreement by providing sixty (60) days' prior written notice.
6. LATE FEE: A late fee of INR 1,000 shall apply if rent is received after the 5th day of the month.
7. MAINTENANCE: Tenant shall keep the apartment in a clean, hygienic, and sanitary condition.
8. DISPUTE RESOLUTION: Any dispute arising out of or in connection with this agreement shall be settled through binding arbitration under the Indian Arbitration and Conciliation Act, held in New Delhi.`;

export const DocumentComparisonWorkspace: React.FC<DocumentComparisonWorkspaceProps> = ({
  onCompare,
  status,
  statusMessage,
  errorMessage,
  onReset,
  onBackToSingleAnalyze,
}) => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [dragActiveA, setDragActiveA] = useState<boolean>(false);
  const [dragActiveB, setDragActiveB] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const inputRefA = useRef<HTMLInputElement>(null);
  const inputRefB = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  };

  const validateFile = (file: File, sideLabel: string): boolean => {
    setLocalError(null);
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt) {
      setLocalError(`${sideLabel}: Unsupported file type. Allowed formats are PDF, DOCX, and TXT.`);
      return false;
    }

    if (file.size === 0) {
      setLocalError(`${sideLabel}: The selected file is empty (0 bytes). Please select a valid document.`);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLocalError(`${sideLabel}: File size exceeds the 10 MB limit. Please upload a smaller document.`);
      return false;
    }

    return true;
  };

  const handleSelectFileA = (file: File) => {
    if (validateFile(file, 'Document A')) {
      setFileA(file);
    }
  };

  const handleSelectFileB = (file: File) => {
    if (validateFile(file, 'Document B')) {
      setFileB(file);
    }
  };

  const handleDragA = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActiveA(true);
    } else if (e.type === 'dragleave') {
      setDragActiveA(false);
    }
  };

  const handleDropA = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveA(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFileA(e.dataTransfer.files[0]);
    }
  };

  const handleDragB = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActiveB(true);
    } else if (e.type === 'dragleave') {
      setDragActiveB(false);
    }
  };

  const handleDropB = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveB(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFileB(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleComparison = () => {
    setLocalError(null);
    const sampleA = new File([SAMPLE_LEASE_A], 'Lease_Agreement_Version_A.txt', {
      type: 'text/plain',
    });
    const sampleB = new File([SAMPLE_LEASE_B], 'Lease_Agreement_Version_B.txt', {
      type: 'text/plain',
    });
    setFileA(sampleA);
    setFileB(sampleB);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileA || !fileB) {
      setLocalError('Please select both Document A and Document B before comparing.');
      return;
    }
    setLocalError(null);
    onCompare(fileA, fileB);
  };

  const isLoading = status === 'reading' || status === 'comparing';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Workspace Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            <GitCompare className="h-4 w-4" aria-hidden="true" />
            <span>Document Comparison</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            Compare Two Legal Documents
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Upload two versions of an agreement to identify factual differences, changed values, and added or missing provisions without speculation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLoadSampleComparison}
            disabled={isLoading}
            id="comparison-load-sample-button"
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
            <span>Load Sample Documents</span>
          </button>

          {onBackToSingleAnalyze && (
            <button
              type="button"
              onClick={onBackToSingleAnalyze}
              id="comparison-back-to-analyze-button"
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 py-2 px-1"
            >
              <span>Single Document Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Dual Workspace Grid */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document A Column */}
          <div className="flex flex-col rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                  A
                </span>
                <span className="text-sm font-semibold text-stone-900">
                  Original / Version A
                </span>
              </div>
              {fileA && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ready</span>
                </span>
              )}
            </div>

            {/* Document A Drop Area */}
            {!fileA ? (
              <div
                onDragEnter={handleDragA}
                onDragLeave={handleDragA}
                onDragOver={handleDragA}
                onDrop={handleDropA}
                onClick={() => inputRefA.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRefA.current?.click();
                  }
                }}
                className={`flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                  dragActiveA
                    ? 'border-stone-900 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'
                }`}
              >
                <input
                  ref={inputRefA}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  id="document-a-input"
                  aria-label="Upload document for Version A"
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSelectFileA(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 mb-3">
                  <UploadCloud className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-xs font-medium text-stone-900">
                  Click or drag <span className="font-semibold">Version A</span> here
                </p>
                <p className="mt-1 text-[11px] text-stone-500">
                  PDF, DOCX, or TXT up to 10 MB
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-200 text-stone-700 font-mono text-[11px] font-bold">
                      {getFileExtension(fileA.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-stone-900" title={fileA.name}>
                        {fileA.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-stone-500">
                        {formatFileSize(fileA.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileA(null);
                      if (inputRefA.current) inputRefA.current.value = '';
                    }}
                    disabled={isLoading}
                    aria-label="Remove Document A"
                    className="rounded-md p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => inputRefA.current?.click()}
                    disabled={isLoading}
                    className="text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2"
                  >
                    Replace Document A
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Document B Column */}
          <div className="flex flex-col rounded-xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-700 text-xs font-bold text-white">
                  B
                </span>
                <span className="text-sm font-semibold text-stone-900">
                  Updated / Version B
                </span>
              </div>
              {fileB && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ready</span>
                </span>
              )}
            </div>

            {/* Document B Drop Area */}
            {!fileB ? (
              <div
                onDragEnter={handleDragB}
                onDragLeave={handleDragB}
                onDragOver={handleDragB}
                onDrop={handleDropB}
                onClick={() => inputRefB.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRefB.current?.click();
                  }
                }}
                className={`flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                  dragActiveB
                    ? 'border-stone-900 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'
                }`}
              >
                <input
                  ref={inputRefB}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  id="document-b-input"
                  aria-label="Upload document for Version B"
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSelectFileB(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 mb-3">
                  <UploadCloud className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-xs font-medium text-stone-900">
                  Click or drag <span className="font-semibold">Version B</span> here
                </p>
                <p className="mt-1 text-[11px] text-stone-500">
                  PDF, DOCX, or TXT up to 10 MB
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-200 text-stone-700 font-mono text-[11px] font-bold">
                      {getFileExtension(fileB.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-stone-900" title={fileB.name}>
                        {fileB.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-stone-500">
                        {formatFileSize(fileB.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileB(null);
                      if (inputRefB.current) inputRefB.current.value = '';
                    }}
                    disabled={isLoading}
                    aria-label="Remove Document B"
                    className="rounded-md p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => inputRefB.current?.click()}
                    disabled={isLoading}
                    className="text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2"
                  >
                    Replace Document B
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {(localError || errorMessage) && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/80 p-4 text-xs text-red-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold text-red-950">Document Comparison Alert</p>
              <p className="mt-0.5 text-red-800">{localError || errorMessage}</p>
            </div>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-medium text-red-900 hover:underline"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Loading Progress State */}
        {isLoading && (
          <div className="rounded-xl border border-stone-200 bg-stone-50/90 p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white mb-3">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-stone-900">
              {statusMessage || 'Comparing legal documents...'}
            </p>
            <p className="mt-1 text-xs text-stone-500 max-w-md mx-auto">
              Extracting document text from both versions, matching clauses, and generating factual, source-grounded differences.
            </p>
          </div>
        )}

        {/* Primary CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-stone-500">
            {!fileA && !fileB && 'Please select both Document A and Document B to begin comparison.'}
            {fileA && !fileB && 'Document A ready. Now select Document B to compare.'}
            {!fileA && fileB && 'Document B ready. Now select Document A to compare.'}
            {fileA && fileB && !isLoading && 'Both documents loaded and verified. Ready to compare.'}
          </div>

          <button
            type="submit"
            id="compare-documents-submit-button"
            disabled={!fileA || !fileB || isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 shadow-xs transition-all hover:bg-stone-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Comparing Documents...</span>
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                <span>Compare Documents</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Informational Guidance Notice */}
      <div className="mt-12 rounded-lg border border-stone-200/70 bg-stone-50/60 p-4 text-xs text-stone-600">
        <p className="font-semibold text-stone-800 mb-1">Document Comparison Protocol</p>
        <p>
          LexPilot compares only the text present in the two uploaded files. Unchanged clauses are omitted from the change list to keep comparisons actionable. The comparison reports objective differences (modified wording, added provisions, or removed clauses) and never infers legal intent, validity, enforceability, or advisability.
        </p>
      </div>
    </div>
  );
};
