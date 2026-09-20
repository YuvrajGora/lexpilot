import React from 'react';
import { Compass, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-stone-200 bg-white py-12 text-stone-600">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-stone-50">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="font-serif text-lg font-semibold text-stone-900">
                LexPilot
              </span>
              <p className="text-xs text-stone-500">
                GenAI Legal Document Navigation Assistant
              </p>
            </div>
          </div>

          {/* Positioning */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-900">Understand.</span>
            <span>Compare.</span>
            <span>Navigate.</span>
            <span className="text-stone-300">|</span>
            <span>Stage 1: Document Understanding</span>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-8 pt-6 border-t border-stone-100">
          <div className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed max-w-4xl">
            <Shield className="h-4 w-4 shrink-0 text-stone-400 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Disclaimer:</strong> LexPilot provides document-based information for educational and informational purposes. It does not provide legal advice or replace a qualified legal professional. The application operates strictly as a document navigation and comprehension assistant grounded in user-provided files.
            </p>
          </div>
          <p className="mt-4 text-[11px] text-stone-700">
            &copy; {new Date().getFullYear()} LexPilot. Built with responsible GenAI grounding.
          </p>
        </div>
      </div>
    </footer>
  );
};
