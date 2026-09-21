import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X, ArrowRight, RefreshCw, FileCode } from 'lucide-react';
import { DocumentInfo, ProcessingStatus } from '../types/analysis';

interface DocumentUploadProps {
  onAnalyze: (file: File) => Promise<void>;
  status: ProcessingStatus;
  statusMessage?: string;
  errorMessage?: string;
  onReset: () => void;
}

const SAMPLE_LEGAL_AGREEMENT = `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made effective as of November 1, 2026 ("Effective Date") by and between Apex Innovations Inc., a Delaware corporation ("Disclosing Party"), and Quantum Dynamics LLC, a California limited liability company ("Receiving Party").

1. PURPOSE
The parties wish to explore a potential strategic business collaboration concerning GenAI technologies and enterprise workflows.

2. CONFIDENTIAL INFORMATION
"Confidential Information" refers to any proprietary, non-public technical, product, customer, or financial data disclosed in writing or orally by either party.

3. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party shall maintain all Confidential Information in strict confidence and shall exercise the same degree of care it uses to protect its own confidential information of like nature, but no less than reasonable care. Confidential Information shall not be disclosed to any third party without prior written consent.

4. FINANCIAL OBLIGATIONS & EXPENSES
Each party shall bear its own legal, advisory, and operational expenses in connection with evaluating the Purpose. If the Receiving Party commits a material breach of Section 3, a pre-agreed liquidated damages assessment of $25,000 shall be payable per verified occurrence.

5. TERM AND TERMINATION
This Agreement shall remain in full force and effect for two (2) years from the Effective Date. Either party may terminate this Agreement at any time by providing thirty (30) days prior written notice to the other party. Upon termination, all Confidential Information must be returned or certified destroyed within ten (10) business days.

6. GOVERNING LAW AND ARBITRATION
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflicts of law principles.`;

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onAnalyze,
  status,
  statusMessage,
  errorMessage,
  onReset,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validateAndSetFile = (file: File) => {
    setLocalError(null);
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt) {
      setLocalError("Unsupported file type. Please upload a PDF, DOCX, or TXT document.");
      return;
    }

    if (file.size === 0) {
      setLocalError("The selected file is empty (0 bytes). Please upload a valid document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLocalError("File size exceeds the 10 MB limit. Please select a smaller document.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onReset();
  };

  const handleStartAnalysis = () => {
    if (!selectedFile) return;
    onAnalyze(selectedFile);
  };

  const handleLoadSample = () => {
    const sampleBlob = new Blob([SAMPLE_LEGAL_AGREEMENT], { type: 'text/plain' });
    const sampleFile = new File([sampleBlob], 'Sample_Mutual_NDA.txt', { type: 'text/plain' });
    validateAndSetFile(sampleFile);
  };

  const isProcessing = status === 'reading' || status === 'analyzing';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header Info */}
      <div className="mb-6 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
          Document Analysis Workspace
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Upload any legal agreement, contract, or lease for source-grounded plain-language analysis.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
        {/* Hidden native input */}
        <input
          ref={inputRef}
          type="file"
          id="legal-document-input"
          aria-label="Upload legal document"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
          className="hidden"
          disabled={isProcessing}
        />

        {/* Dropzone Container */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            id="dropzone-box"
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-all focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 ${
              dragActive
                ? 'border-stone-900 bg-stone-100/70 scale-[0.99]'
                : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-stone-900">
                  Click to select or drag and drop a document
                </p>
                <p className="text-xs text-stone-500">
                  PDF, DOCX, or TXT up to 10 MB
                </p>
              </div>

              {/* Status announcement for screen readers */}
              <p className="sr-only" aria-live="polite">
                No document selected. Choose a PDF, DOCX, or TXT file to begin analysis.
              </p>
            </div>
          </div>
        ) : (
          /* File Selected Card */
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-stone-50">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-stone-900" title={selectedFile.name}>
                    {selectedFile.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="font-mono uppercase font-semibold text-stone-700">
                      {selectedFile.name.split('.').pop()}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                      Ready to analyze
                    </span>
                  </div>
                </div>
              </div>

              {!isProcessing && (
                <button
                  onClick={handleClear}
                  id="remove-file-button"
                  aria-label="Remove document"
                  className="rounded-md p-1.5 text-stone-400 hover:bg-stone-200/70 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Processing / Progress Indicator */}
            {isProcessing && (
              <div className="mt-5 border-t border-stone-200 pt-4" aria-live="assertive">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-stone-900" aria-hidden="true" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-stone-900">
                      {status === 'reading' ? 'Reading your document...' : 'Analyzing clauses with Gemini...'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {statusMessage || 'Extracting text and grounding citations...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {(localError || errorMessage) && (
          <div
            className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-red-800">Document Processing Issue</p>
              <p className="mt-0.5 text-red-700">{localError || errorMessage}</p>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100 pt-5">
          <div>
            {!selectedFile && (
              <button
                type="button"
                onClick={handleLoadSample}
                id="load-sample-button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-4"
              >
                <FileCode className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Try Sample Mutual NDA</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedFile && !isProcessing && (
              <button
                type="button"
                onClick={handleStartAnalysis}
                id="start-analysis-button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-xs font-semibold text-stone-50 shadow-xs transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
              >
                <span>Run Document Analysis</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
