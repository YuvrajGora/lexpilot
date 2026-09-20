import React from 'react';
import { ArrowRight, GitCompare, FileCheck, Shield, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingHeroProps {
  onStartAnalysis: () => void;
  onStartComparison: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartAnalysis, onStartComparison }) => {
  return (
    <div className="space-y-16 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl text-center px-4">
        {/* Positioning Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-stone-100/90 px-3.5 py-1 text-xs font-medium text-stone-700 mb-6">
          <span className="font-semibold text-stone-900">Analyze.</span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-600">Compare.</span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-600">Understand.</span>
        </div>

        {/* Primary Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-900 leading-[1.15]">
          Understand complex legal documents with calm clarity.
        </h1>

        {/* Narrative Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-stone-600 leading-relaxed font-sans">
          LexPilot uses generative AI to help users understand legal agreements and compare two versions to identify meaningful, factual differences — with strict source grounding and zero guesswork.
        </p>

        {/* Dual Call to Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartAnalysis}
            id="landing-hero-cta-button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-6 py-3.5 text-sm font-semibold text-stone-50 shadow-sm transition-all hover:bg-stone-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
          >
            <span>Analyze a Document</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            onClick={onStartComparison}
            id="landing-hero-compare-button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-800 shadow-xs transition-all hover:bg-stone-50 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
          >
            <GitCompare className="h-4 w-4 text-stone-600" aria-hidden="true" />
            <span>Compare Documents</span>
          </button>
        </div>

        <p className="mt-3 text-xs text-stone-700 font-medium">
          Supported formats: PDF, DOCX, TXT (up to 10 MB per file)
        </p>
      </section>

      {/* How LexPilot Works */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="border-t border-stone-200 pt-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
              How LexPilot Works
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              A transparent, document-grounded process designed to illuminate terms without replacing qualified counsel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-900 mb-4">
                <FileCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                1. Document Extraction
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Upload your contract, lease, or agreement in PDF, DOCX, or TXT format. Text is extracted directly and validated for completeness.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-900 mb-4">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                2. Source-Grounded Analysis
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                The Gemini model breaks down clauses using untrusted-data isolation, mapping obligations directly back to exact textual excerpts in your file.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-900 mb-4">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                3. Plain-Language Dashboard
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Review financial terms, key deadlines, termination rights, and flagged clauses in structured, plain English without legal jargon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI Disclaimer Banner */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-5 text-amber-900">
          <div className="flex items-start gap-3.5">
            <Shield className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                Responsible AI Notice & Legal Disclaimer
              </h3>
              <p className="text-sm text-amber-900/90 leading-relaxed">
                LexPilot provides document-based information for educational and informational purposes. It does not provide legal advice or replace a qualified legal professional. The model only reads the text provided, highlights verbatim excerpts, and does not invent facts or make definitive legal declarations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
