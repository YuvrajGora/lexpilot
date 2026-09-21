import React from 'react';
import { Compass, GitCompare, ArrowRight, FileText } from 'lucide-react';

interface HeaderProps {
  onNavigateToUpload: () => void;
  onNavigateToCompare: () => void;
  onNavigateHome: () => void;
  hasActiveAnalysis: boolean;
  hasActiveComparison: boolean;
  onViewResults: () => void;
  onViewComparisonResults: () => void;
  isBackendConnected: boolean;
  activeMode?: 'analyze' | 'compare';
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateToUpload,
  onNavigateToCompare,
  onNavigateHome,
  hasActiveAnalysis,
  hasActiveComparison,
  onViewResults,
  onViewComparisonResults,
  isBackendConnected,
  activeMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <button
          onClick={onNavigateHome}
          id="header-brand-button"
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 rounded-lg p-1"
          aria-label="LexPilot Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-stone-50 shadow-xs">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-serif text-xl font-semibold tracking-tight text-stone-900">
              LexPilot
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-stone-500 tracking-wide uppercase">
              Legal Nav
            </span>
          </div>
        </button>

        {/* Status indicator & Navigation CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Badge */}
          <div
            className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100/80 px-2.5 py-1 text-xs font-medium text-stone-700"
            title={isBackendConnected ? "Connected to LexPilot engine" : "Checking backend connection..."}
          >
            <span
              className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}
              aria-hidden="true"
            />
            <span className="hidden lg:inline">
              {isBackendConnected ? 'Engine Ready' : 'Connecting'}
            </span>
          </div>

          {hasActiveAnalysis && (
            <button
              onClick={onViewResults}
              id="header-view-results-button"
              aria-label="View analysis results"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900 px-2.5 py-1.5 rounded-md hover:bg-stone-200/60 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
              <span className="hidden sm:inline">Analysis</span>
            </button>
          )}

          {hasActiveComparison && (
            <button
              onClick={onViewComparisonResults}
              id="header-view-comparison-button"
              aria-label="View comparison results"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900 px-2.5 py-1.5 rounded-md hover:bg-stone-200/60 transition-colors"
            >
              <GitCompare className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
              <span className="hidden sm:inline">Comparison</span>
            </button>
          )}

          {/* Navigation Mode Buttons */}
          <button
            onClick={onNavigateToUpload}
            id="header-nav-analyze-button"
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeMode === 'analyze'
                ? 'bg-stone-900 text-stone-50 shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/60'
            }`}
          >
            <span>Analyze</span>
          </button>

          <button
            onClick={onNavigateToCompare}
            id="header-nav-compare-button"
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeMode === 'compare'
                ? 'bg-stone-900 text-stone-50 shadow-xs'
                : 'border border-stone-300 bg-white text-stone-800 shadow-xs hover:bg-stone-100'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Compare Documents</span>
          </button>
        </div>
      </div>
    </header>
  );
};
