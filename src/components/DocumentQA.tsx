import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Send,
  Loader2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { QAResponse } from '../types/qa';
import { askDocumentQuestion } from '../services/api';
import { EvidenceViewer } from './EvidenceViewer';

interface DocumentQAProps {
  documentText?: string;
  documentSummary?: string;
  documentLabel?: string;
  onNavigateToSection?: (sectionId: string) => void;
}

export const DocumentQA: React.FC<DocumentQAProps> = ({
  documentText,
  documentSummary,
  documentLabel,
  onNavigateToSection,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<QAResponse | null>(null);
  const [lastAskedQuestion, setLastAskedQuestion] = useState<string>('');

  const suggestedQuestions = [
    'What are the payment amounts and schedules?',
    'How can either party terminate this agreement?',
    'What are the notice requirements for termination?',
    'What are the primary obligations of each party?',
    'Are there late fees, penalties, or interest charges?',
  ];

  // If extracted text is missing, synthesize grounded context from available summary
  const effectiveDocumentText = documentText || documentSummary || '';

  const handleAsk = async (qToAsk?: string) => {
    const q = (qToAsk || question).trim();
    if (!q) return;

    if (!effectiveDocumentText) {
      setError('Document text is not available for Q&A.');
      return;
    }

    setLoading(true);
    setError(null);
    setLastAskedQuestion(q);

    try {
      const res = await askDocumentQuestion(effectiveDocumentText, q);
      setResponse(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve grounded answer. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion('');
    setResponse(null);
    setError(null);
    setLastAskedQuestion('');
  };

  const handleSelectSuggested = (suggested: string) => {
    setQuestion(suggested);
    handleAsk(suggested);
  };

  return (
    <section
      id="section-qa"
      aria-labelledby="section-qa-heading"
      className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-emerald-800" aria-hidden="true" />
            <h2 id="section-qa-heading" className="font-serif text-xl font-normal text-stone-900">
              Ask About This Document
            </h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Answers are grounded strictly and exclusively in the uploaded document text.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-600">
          <Info className="h-3 w-3 text-stone-500" aria-hidden="true" />
          <span>Informational Only • No Legal Advice</span>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="mt-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mb-2">
          <Sparkles className="h-3 w-3 text-stone-400" aria-hidden="true" />
          <span>Suggested Questions</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((sq, idx) => (
            <button
              key={idx}
              id={`suggested-question-${idx}`}
              type="button"
              onClick={() => handleSelectSuggested(sq)}
              disabled={loading}
              className="rounded-lg border border-stone-200 bg-stone-50/70 px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors text-left disabled:opacity-50"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="mt-5"
      >
        <div className="relative">
          <label htmlFor="qa-question-input" className="sr-only">
            Ask a question about this document
          </label>
          <input
            id="qa-question-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={1000}
            placeholder="Ask a question about this document (e.g., What are the payment terms?)..."
            disabled={loading}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 shadow-2xs focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200 pr-28 disabled:bg-stone-50"
          />

          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            {question && (
              <button
                type="button"
                id="qa-clear-input-button"
                onClick={() => setQuestion('')}
                className="rounded-lg p-1.5 text-stone-400 hover:text-stone-600"
                title="Clear input"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="submit"
              id="qa-submit-button"
              disabled={loading || !question.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Ask</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-2.5"
        >
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Error retrieving answer:</span> {error}
          </div>
          <button
            onClick={() => handleAsk()}
            className="font-semibold underline hover:no-underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State Skeleton */}
      {loading && !response && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50/50 p-5 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-28 bg-stone-200 rounded"></div>
            <div className="h-4 w-16 bg-stone-200 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-stone-200 rounded"></div>
            <div className="h-3.5 w-4/5 bg-stone-200 rounded"></div>
          </div>
        </div>
      )}

      {/* Answer Result Card */}
      {response && (
        <div
          id="qa-response-card"
          className="mt-6 rounded-xl border border-stone-200 bg-stone-50/40 p-5 shadow-2xs space-y-4"
        >
          {/* Question & Grounding Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Question
              </span>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">
                {lastAskedQuestion}
              </p>
            </div>

            <div className="self-start sm:self-auto">
              {response.grounded ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Grounded in Document</span>
                </span>
              ) : response.confidence === 'not_specified' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                  <span>Not Specified in Document</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                  <HelpCircle className="h-3.5 w-3.5 text-stone-600" />
                  <span>Insufficient Document Information</span>
                </span>
              )}
            </div>
          </div>

          {/* Plain Language Answer */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Answer
            </span>
            <p className="mt-1 text-sm text-stone-800 leading-relaxed">
              {response.answer}
            </p>
          </div>

          {/* Structured Document Evidence */}
          <EvidenceViewer
            evidence={response.evidence}
            fallbackSourceText={response.source_text}
            fallbackLocation={response.source_location}
            fallbackStatus={
              response.confidence === 'not_specified'
                ? 'not_specified'
                : response.confidence === 'insufficient_information'
                ? 'insufficient_evidence'
                : 'directly_stated'
            }
            documentLabel={documentLabel}
            defaultExpanded={true}
            expandable={true}
            buttonLabel="View source evidence"
            onNavigateToSection={onNavigateToSection}
          />

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
            <span className="text-[11px] text-stone-500 italic">
              Based solely on uploaded document content.
            </span>
            <button
              type="button"
              id="qa-reset-answer-button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Ask Another Question</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

