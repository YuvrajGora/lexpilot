import React, { useState } from 'react';
import { Quote, ChevronDown, ChevronUp, ShieldCheck, AlertCircle, HelpCircle, ArrowUpRight, Bookmark } from 'lucide-react';
import { SourceEvidence, EvidenceStatus } from '../types/evidence';

export interface EvidenceViewerProps {
  evidence?: SourceEvidence | null;
  fallbackSourceText?: string | null;
  fallbackLocation?: string | null;
  fallbackSection?: string | null;
  fallbackStatus?: EvidenceStatus;
  documentLabel?: string;
  defaultExpanded?: boolean;
  expandable?: boolean;
  buttonLabel?: string;
  targetSectionId?: string;
  onNavigateToSection?: (sectionId: string) => void;
  className?: string;
  id?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  evidence,
  fallbackSourceText,
  fallbackLocation,
  fallbackSection,
  fallbackStatus,
  documentLabel,
  defaultExpanded = false,
  expandable = true,
  buttonLabel,
  targetSectionId,
  onNavigateToSection,
  className = '',
  id,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const effectiveSourceText = evidence?.source_text ?? fallbackSourceText;
  const effectiveLocation = evidence?.location ?? fallbackLocation;
  const effectiveSection = evidence?.section ?? fallbackSection;
  const effectiveDocument = evidence?.document ?? documentLabel;

  // Determine evidence status
  let status: EvidenceStatus = evidence?.evidence_status ?? fallbackStatus ?? 'directly_stated';
  if (!effectiveSourceText || effectiveSourceText.trim() === '' || effectiveSourceText.toLowerCase().includes('not found in document') || effectiveSourceText.toLowerCase().includes('not specified')) {
    if (status === 'directly_stated') {
      status = 'not_specified';
    }
  }

  // If there's truly no source text and it's marked directly_stated without content, don't show empty block
  const hasContent = Boolean(effectiveSourceText && effectiveSourceText.trim());

  if (!hasContent && !effectiveLocation && !effectiveSection && status !== 'not_specified') {
    return null;
  }

  return (
    <div id={id} className={`evidence-container ${className}`}>
      {expandable && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded py-1 px-1.5 -ml-1.5"
        >
          <Quote className="h-3 w-3 text-stone-400" aria-hidden="true" />
          <span>
            {isExpanded
              ? 'Hide source'
              : buttonLabel || 'View source'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 text-stone-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3 text-stone-400" aria-hidden="true" />
          )}
        </button>
      )}

      {(!expandable || isExpanded) && (
        <div className="mt-2.5 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3 transition-all duration-300">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
              <Quote className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
              <span>Source Evidence</span>
              {effectiveDocument && (
                <>
                  <span className="text-stone-300">•</span>
                  <span className="text-[11px] font-mono text-stone-500 font-normal">
                    {effectiveDocument}
                  </span>
                </>
              )}
            </div>

            <div>
              {status === 'directly_stated' && hasContent ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                  <span>Directly stated</span>
                </span>
              ) : status === 'not_specified' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                  <AlertCircle className="h-3 w-3 text-amber-600" aria-hidden="true" />
                  <span>Not specified in document</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700 border border-stone-200">
                  <HelpCircle className="h-3 w-3 text-stone-500" aria-hidden="true" />
                  <span>Insufficient evidence</span>
                </span>
              )}
            </div>
          </div>

          {/* Quoted Text */}
          {hasContent ? (
            <blockquote className="rounded-lg bg-stone-50/80 p-3 text-xs font-mono text-stone-800 border-l-2 border-stone-600 leading-relaxed whitespace-pre-wrap break-words">
              &ldquo;{effectiveSourceText}&rdquo;
            </blockquote>
          ) : (
            <div className="rounded-lg bg-stone-50/60 p-3 text-xs italic text-stone-500 border border-dashed border-stone-200">
              Not specified in the document.
            </div>
          )}

          {/* Footer Metadata & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-500">
            <div className="flex flex-wrap items-center gap-3">
              {effectiveSection && (
                <span className="inline-flex items-center gap-1">
                  <Bookmark className="h-3 w-3 text-stone-400" aria-hidden="true" />
                  <span>Section: <strong className="font-semibold text-stone-700">{effectiveSection}</strong></span>
                </span>
              )}

              {effectiveLocation && effectiveLocation !== 'Unavailable' && (
                <span className="inline-flex items-center gap-1">
                  <span>Location: <strong className="font-mono text-stone-700">{effectiveLocation}</strong></span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {targetSectionId && onNavigateToSection && (
                <button
                  type="button"
                  onClick={() => onNavigateToSection(targetSectionId)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:text-stone-900 transition-colors focus:outline-none"
                >
                  <span>View in document</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </button>
              )}

              {expandable && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-[11px] text-stone-400 hover:text-stone-700"
                >
                  Hide source
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
