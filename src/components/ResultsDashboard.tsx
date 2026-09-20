import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  LogOut, 
  AlertTriangle, 
  ArrowLeft,
  ShieldAlert,
  Info
} from 'lucide-react';
import { AnalysisResult } from '../types/analysis';
import { DocumentNavigator } from './DocumentNavigator';
import { DocumentQA } from './DocumentQA';
import { EvidenceViewer } from './EvidenceViewer';

interface ResultsDashboardProps {
  result: AnalysisResult;
  fileName: string;
  onNewAnalysis: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  fileName,
  onNewAnalysis,
}) => {
  const [activeHighlightSection, setActiveHighlightSection] = useState<string | null>(null);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHighlightSection(sectionId);
      setTimeout(() => {
        setActiveHighlightSection(null);
      }, 1600);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <span>Verified Analysis</span>
            <span>•</span>
            <span className="text-stone-700 font-mono">{fileName}</span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-stone-900 mt-1">
            {result.document_type || 'Legal Document Analysis'}
          </h1>
        </div>

        <button
          onClick={onNewAnalysis}
          id="new-analysis-button"
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Analyze Another Document</span>
        </button>
      </div>

      {/* Explore this document — Guided Navigation */}
      <DocumentNavigator result={result} onNavigate={handleNavigate} />

      {/* 1. Document Overview */}
      <section
        id="section-overview"
        aria-labelledby="section-overview-heading"
        className={`rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs scroll-mt-8 transition-all duration-500 ${
          activeHighlightSection === 'section-overview' ? 'ring-2 ring-stone-500 ring-offset-2' : ''
        }`}
      >
        <h2 id="section-overview-heading" className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-stone-700" aria-hidden="true" />
          <span>Document Overview</span>
        </h2>

        {/* Executive Summary */}
        <div className="mt-4 rounded-xl bg-stone-50 p-4 sm:p-5 border border-stone-200/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Plain-Language Purpose & Scope
          </h3>
          <p className="text-sm text-stone-800 leading-relaxed">
            {result.summary}
          </p>
        </div>

        {/* Identified Parties */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-stone-500" aria-hidden="true" />
            <span>Parties to the Agreement</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.parties && result.parties.length > 0 ? (
              result.parties.map((party, idx) => (
                <div key={idx} className="rounded-lg border border-stone-200 p-3.5 bg-stone-50/40">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    {party.role || 'Party'}
                  </div>
                  <div className="text-sm font-semibold text-stone-900 mt-0.5">
                    {party.name}
                  </div>
                  {(party.evidence || party.source_text) && (
                    <EvidenceViewer
                      evidence={party.evidence}
                      fallbackSourceText={party.source_text}
                      fallbackSection="Parties to Agreement"
                      documentLabel={fileName}
                      targetSectionId="section-overview"
                      onNavigateToSection={handleNavigate}
                      buttonLabel="View source"
                      className="mt-2 pt-2 border-t border-stone-200/60"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500 italic">No specific parties named in document.</p>
            )}
          </div>
        </div>
      </section>

      {/* 2. Attention Items (Crucial Clauses) */}
      <section
        id="section-attention"
        aria-labelledby="section-attention-heading"
        className={`rounded-2xl border border-amber-200 bg-amber-50/40 p-6 sm:p-8 shadow-xs scroll-mt-8 transition-all duration-500 ${
          activeHighlightSection === 'section-attention' ? 'ring-2 ring-amber-500 ring-offset-2' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="section-attention-heading" className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-amber-800" aria-hidden="true" />
            <span>Clauses Worth Reviewing</span>
          </h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
            {result.attention_items?.length || 0} Noteworthy Items
          </span>
        </div>
        <p className="mt-1 text-xs text-amber-900/80">
          The items below represent provisions that warrant attention due to deadlines, liability allocations, or unusual requirements.
        </p>

        <div className="mt-5 space-y-4">
          {result.attention_items && result.attention_items.length > 0 ? (
            result.attention_items.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-amber-200/90 bg-white p-5 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-sm bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      <span>Worth Reviewing</span>
                    </div>
                    <h3 className="text-base font-semibold text-stone-900 mt-1.5">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-2 text-sm text-stone-700 leading-relaxed">
                  {item.explanation}
                </p>

                {/* Direct Document Excerpt & Evidence */}
                <EvidenceViewer
                  evidence={item.evidence}
                  fallbackSourceText={item.source_text}
                  fallbackSection="Clauses Worth Reviewing"
                  documentLabel={fileName}
                  targetSectionId="section-attention"
                  onNavigateToSection={handleNavigate}
                  buttonLabel="View source"
                  className="mt-3 pt-3 border-t border-stone-100"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500 italic">No specific risk or attention flags detected in this document.</p>
          )}
        </div>
      </section>

      {/* 3. Important Dates */}
      <section
        id="section-dates"
        aria-labelledby="section-dates-heading"
        className={`rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs scroll-mt-8 transition-all duration-500 ${
          activeHighlightSection === 'section-dates' ? 'ring-2 ring-stone-500 ring-offset-2' : ''
        }`}
      >
        <h2 id="section-dates-heading" className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-stone-700" aria-hidden="true" />
          <span>Important Dates & Deadlines</span>
        </h2>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.important_dates && result.important_dates.length > 0 ? (
            result.important_dates.map((d, idx) => (
              <div key={idx} className="rounded-xl border border-stone-200 p-4 bg-stone-50/50">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600">
                  <Calendar className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  <span>{d.date}</span>
                </div>
                <p className="mt-1 text-sm text-stone-800">
                  {d.description}
                </p>
                {(d.evidence || d.source_text) && (
                  <EvidenceViewer
                    evidence={d.evidence}
                    fallbackSourceText={d.source_text}
                    fallbackSection="Important Dates & Deadlines"
                    documentLabel={fileName}
                    targetSectionId="section-dates"
                    onNavigateToSection={handleNavigate}
                    buttonLabel="View source"
                    className="mt-3 pt-2 border-t border-stone-200/60"
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500 italic col-span-2">Not specified in the document.</p>
          )}
        </div>
      </section>

      {/* 4. Financial Obligations */}
      <section
        id="section-financial"
        aria-labelledby="section-financial-heading"
        className={`rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs scroll-mt-8 transition-all duration-500 ${
          activeHighlightSection === 'section-financial' ? 'ring-2 ring-stone-500 ring-offset-2' : ''
        }`}
      >
        <h2 id="section-financial-heading" className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2.5">
          <DollarSign className="h-5 w-5 text-stone-700" aria-hidden="true" />
          <span>Financial Obligations & Costs</span>
        </h2>

        <div className="mt-5 space-y-4">
          {result.financial_obligations && result.financial_obligations.length > 0 ? (
            result.financial_obligations.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-stone-200 p-4 bg-stone-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">
                      {item.description}
                    </h3>
                    {item.frequency && (
                      <span className="text-xs text-stone-500">
                        Frequency: {item.frequency}
                      </span>
                    )}
                  </div>
                  <div className="self-start sm:self-auto rounded-md bg-stone-900 px-3 py-1 text-xs font-mono font-semibold text-stone-50">
                    {item.amount || 'Not specified'}
                  </div>
                </div>

                <EvidenceViewer
                  evidence={item.evidence}
                  fallbackSourceText={item.source_text}
                  fallbackSection="Financial Obligations & Costs"
                  documentLabel={fileName}
                  targetSectionId="section-financial"
                  onNavigateToSection={handleNavigate}
                  buttonLabel="View source"
                  className="mt-3 pt-2 border-t border-stone-200/60"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500 italic">Not specified in the document.</p>
          )}
        </div>
      </section>

      {/* 5. Key Obligations by Party */}
      <section
        id="section-obligations"
        aria-labelledby="section-obligations-heading"
        className={`rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs scroll-mt-8 transition-all duration-500 ${
          activeHighlightSection === 'section-obligations' ? 'ring-2 ring-stone-500 ring-offset-2' : ''
        }`}
      >
        <h2 id="section-obligations-heading" className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2.5">
          <CheckSquare className="h-5 w-5 text-stone-700" aria-hidden="true" />
          <span>Key Obligations</span>
        </h2>

        <div className="mt-5 space-y-4">
          {result.key_obligations && result.key_obligations.length > 0 ? (
            result.key_obligations.map((ob, idx) => (
              <div key={idx} className="rounded-xl border border-stone-200 p-4 bg-stone-50/40">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Responsible Party: {ob.party || 'Not specified'}
                </div>
                <p className="text-sm text-stone-800 leading-relaxed">
                  {ob.obligation}
                </p>

                <EvidenceViewer
                  evidence={ob.evidence}
                  fallbackSourceText={ob.source_text}
                  fallbackSection="Key Obligations"
                  documentLabel={fileName}
                  targetSectionId="section-obligations"
                  onNavigateToSection={handleNavigate}
                  buttonLabel="View source"
                  className="mt-3 pt-2 border-t border-stone-200/60"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500 italic">Not specified in the document.</p>
          )}
        </div>
      </section>

      {/* 6. Termination Clause */}
      <section
        id="section-termination"
        aria-labelledby="section-termination-heading"
        className={`rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs scroll-mt-8 transition-all duration-500 ${
          activeHighlightSection === 'section-termination' ? 'ring-2 ring-stone-500 ring-offset-2' : ''
        }`}
      >
        <h2 id="section-termination-heading" className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2.5">
          <LogOut className="h-5 w-5 text-stone-700" aria-hidden="true" />
          <span>Termination & Exit Conditions</span>
        </h2>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Summary of Termination Rights
            </h3>
            <p className="text-sm text-stone-800 leading-relaxed">
              {result.termination?.summary || 'Not specified in the document.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-stone-200 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Notice Period Required
              </span>
              <p className="text-sm font-semibold text-stone-900 mt-1">
                {result.termination?.notice_period || 'Not specified in the document.'}
              </p>
            </div>

            <div className="rounded-lg border border-stone-200 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Termination Conditions
              </span>
              {result.termination?.conditions && result.termination.conditions.length > 0 ? (
                <ul className="mt-1 space-y-1 text-xs text-stone-700 list-disc list-inside">
                  {result.termination.conditions.map((cond, i) => (
                    <li key={i}>{cond}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-stone-500 italic mt-1">Not specified in the document.</p>
              )}
            </div>
          </div>

          <EvidenceViewer
            evidence={result.termination?.evidence}
            fallbackSourceText={result.termination?.source_text}
            fallbackSection="Termination & Exit Conditions"
            documentLabel={fileName}
            targetSectionId="section-termination"
            onNavigateToSection={handleNavigate}
            buttonLabel="View source"
            className="pt-2"
          />
        </div>
      </section>

      {/* 7. Ask About This Document — Grounded Q&A */}
      <DocumentQA
        documentText={result.extracted_text}
        documentSummary={result.summary}
        documentLabel={fileName}
        onNavigateToSection={handleNavigate}
      />

      {/* Bottom Legal Disclaimer */}
      <div className="rounded-xl border border-stone-200 bg-stone-100/60 p-4 text-xs text-stone-600 flex items-start gap-3">
        <Info className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Notice:</strong> LexPilot provides document-based information for educational and informational purposes. It does not provide legal advice or replace a qualified legal professional. The analysis presented reflects automated extraction grounded in your uploaded document text.
        </p>
      </div>
    </div>
  );
};
