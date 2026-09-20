import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  FileText,
  Filter,
  CheckCircle2,
  Printer,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Quote,
} from 'lucide-react';
import { ComparisonResult, ChangeItem, CategoryType, ChangeType } from '../types/comparison';
import { EvidenceViewer } from './EvidenceViewer';

interface ComparisonResultsDashboardProps {
  result: ComparisonResult;
  docAName: string;
  docBName: string;
  onNewComparison: () => void;
  onNavigateToSingleAnalyze?: () => void;
}

type FilterCategory = 'all' | 'financial' | 'dates' | 'obligations' | 'termination' | 'restrictions' | 'other';

export const ComparisonResultsDashboard: React.FC<ComparisonResultsDashboardProps> = ({
  result,
  docAName,
  docBName,
  onNewComparison,
  onNavigateToSingleAnalyze,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

  // Filter items according to the requested lightweight filters
  const filteredChanges = result.changes.filter((change) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'financial') return change.category === 'financial';
    if (selectedCategory === 'dates') return change.category === 'dates';
    if (selectedCategory === 'obligations') return change.category === 'obligations';
    if (selectedCategory === 'termination') return change.category === 'termination';
    if (selectedCategory === 'restrictions') return change.category === 'restrictions';
    if (selectedCategory === 'other') {
      return (
        change.category === 'liability' ||
        change.category === 'dispute_resolution' ||
        change.category === 'access' ||
        change.category === 'notices' ||
        change.category === 'other'
      );
    }
    return true;
  });

  const getCategoryCount = (cat: FilterCategory): number => {
    if (cat === 'all') return result.changes.length;
    if (cat === 'other') {
      return result.changes.filter(
        (c) =>
          c.category === 'liability' ||
          c.category === 'dispute_resolution' ||
          c.category === 'access' ||
          c.category === 'notices' ||
          c.category === 'other'
      ).length;
    }
    return result.changes.filter((c) => c.category === cat).length;
  };

  const getCategoryLabel = (category: CategoryType): string => {
    switch (category) {
      case 'financial':
        return 'Financial';
      case 'dates':
        return 'Dates & Deadlines';
      case 'termination':
        return 'Termination';
      case 'obligations':
        return 'Obligations';
      case 'restrictions':
        return 'Restrictions';
      case 'liability':
        return 'Liability';
      case 'dispute_resolution':
        return 'Dispute Resolution';
      case 'access':
        return 'Access Rights';
      case 'notices':
        return 'Notices';
      default:
        return 'General Clause';
    }
  };

  const renderChangeTypeBadge = (changeType: ChangeType) => {
    switch (changeType) {
      case 'modified':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
            <ArrowLeftRight className="h-3 w-3 text-amber-700" aria-hidden="true" />
            <span>Modified</span>
          </span>
        );
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900">
            <PlusCircle className="h-3 w-3 text-emerald-700" aria-hidden="true" />
            <span>Added in B</span>
          </span>
        );
      case 'removed':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-800">
            <MinusCircle className="h-3 w-3 text-stone-600" aria-hidden="true" />
            <span>Removed from B</span>
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 print:p-0">
      {/* Top Banner: Document Comparison */}
      <div className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              <GitCompare className="h-4 w-4" aria-hidden="true" />
              <span>Document Comparison</span>
            </div>
            {/* Document A -> Document B */}
            <div className="flex flex-wrap items-center gap-2 font-serif text-xl sm:text-2xl font-normal text-stone-900">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">
                  A
                </span>
                <span>{docAName}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-stone-400 shrink-0" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-700 text-[10px] font-bold text-white">
                  B
                </span>
                <span>{docBName}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              id="comparison-print-button"
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50"
            >
              <Printer className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
              <span>Print</span>
            </button>
            <button
              onClick={onNewComparison}
              id="comparison-new-button"
              className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Comparison</span>
            </button>
          </div>
        </div>

        {/* Document Metadata Badges */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60">
            <span className="font-semibold text-stone-900">Version A Type:</span>
            <span>{result.document_a.document_type || 'Legal Document'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60">
            <span className="font-semibold text-stone-900">Version B Type:</span>
            <span>{result.document_b.document_type || 'Legal Document'}</span>
          </div>
        </div>
      </div>

      {/* Comparison Summary Section */}
      <section className="mb-8 rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
        <h2 className="font-serif text-lg sm:text-xl font-medium text-stone-900 mb-2">
          Comparison Summary
        </h2>
        <p className="text-sm leading-relaxed text-stone-700">
          {result.summary}
        </p>
      </section>

      {/* Changes Found Header & Filter Controls */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
              Changes Found
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing {filteredChanges.length} of {result.changes.length} meaningful difference{result.changes.length === 1 ? '' : 's'}. Unchanged clauses are omitted.
            </p>
          </div>

          {/* Change Count Pill */}
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-stone-200 bg-stone-100/90 px-3 py-1 text-xs font-semibold text-stone-800">
            <span>{result.changes.length} Difference{result.changes.length === 1 ? '' : 's'} Identified</span>
          </div>
        </div>

        {/* Change Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 print:hidden">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'financial', label: 'Financial' },
              { id: 'dates', label: 'Dates' },
              { id: 'obligations', label: 'Obligations' },
              { id: 'termination', label: 'Termination' },
              { id: 'restrictions', label: 'Restrictions' },
              { id: 'other', label: 'Other' },
            ] as const
          ).map((tab) => {
            const count = getCategoryCount(tab.id);
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                id={`filter-tab-${tab.id}`}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white font-semibold shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? 'bg-stone-700 text-stone-100' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty State for Filter */}
        {filteredChanges.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-stone-800">
              No changes found in the &ldquo;{selectedCategory}&rdquo; category.
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Select another filter or choose &ldquo;All&rdquo; to view all identified differences.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-3 inline-flex items-center text-xs font-semibold text-stone-900 underline underline-offset-2"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* List of Differences */}
        <div className="space-y-5">
          {filteredChanges.map((change, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              {/* Change Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 uppercase tracking-wide">
                    {getCategoryLabel(change.category)}
                  </span>
                  {renderChangeTypeBadge(change.change_type)}
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-900">
                    {change.title}
                  </h3>
                </div>
              </div>

              {/* What Changed - Plain Language Explanation */}
              <div className="my-3.5 rounded-lg bg-stone-50/90 border border-stone-200/70 p-3 text-xs text-stone-800">
                <span className="font-semibold text-stone-900">What changed: </span>
                <span>{change.explanation}</span>
              </div>

              {/* Document A vs Document B Comparison Quotes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Document A Side */}
                <div className="rounded-lg border border-stone-200/80 bg-stone-50/50 p-3.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-800 text-[9px] font-bold text-white">
                        A
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        Document A ({docAName})
                      </span>
                    </div>
                  </div>

                  {/* Text statement */}
                  <p className="text-xs text-stone-700 mb-2 font-medium">
                    {change.document_a.text}
                  </p>

                  {/* Verbatim Source Evidence */}
                  <EvidenceViewer
                    evidence={change.document_a.evidence}
                    fallbackSourceText={change.document_a.source}
                    fallbackStatus={
                      !change.document_a.source || change.document_a.source.includes('Not found')
                        ? 'not_specified'
                        : 'directly_stated'
                    }
                    documentLabel={`Doc A: ${docAName}`}
                    defaultExpanded={true}
                    expandable={false}
                  />
                </div>

                {/* Document B Side */}
                <div className="rounded-lg border border-stone-200/80 bg-stone-50/50 p-3.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-700 text-[9px] font-bold text-white">
                        B
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        Document B ({docBName})
                      </span>
                    </div>
                  </div>

                  {/* Text statement */}
                  <p className="text-xs text-stone-700 mb-2 font-medium">
                    {change.document_b.text}
                  </p>

                  {/* Verbatim Source Evidence */}
                  <EvidenceViewer
                    evidence={change.document_b.evidence}
                    fallbackSourceText={change.document_b.source}
                    fallbackStatus={
                      !change.document_b.source || change.document_b.source.includes('Not found')
                        ? 'not_specified'
                        : 'directly_stated'
                    }
                    documentLabel={`Doc B: ${docBName}`}
                    defaultExpanded={true}
                    expandable={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation & Legal Disclaimer */}
      <div className="mt-12 border-t border-stone-200 pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onNewComparison}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 shadow-xs hover:bg-stone-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Compare Another Pair</span>
          </button>

          {onNavigateToSingleAnalyze && (
            <button
              onClick={onNavigateToSingleAnalyze}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2"
            >
              Switch to Single Document Analysis
            </button>
          )}
        </div>

        <div className="mt-6 rounded-md bg-stone-100/70 p-3 text-[11px] text-stone-500 leading-normal">
          <span className="font-semibold text-stone-700">Notice: </span>
          LexPilot comparison reports factual differences identified between the two documents. It does not provide legal advice, evaluate contract fairness, or assess legal validity.
        </div>
      </div>
    </div>
  );
};
