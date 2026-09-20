import React from 'react';
import {
  Compass,
  FileText,
  ShieldAlert,
  Calendar,
  DollarSign,
  CheckSquare,
  LogOut,
  MessageSquareQuote,
} from 'lucide-react';
import { AnalysisResult } from '../types/analysis';

interface DocumentNavigatorProps {
  result: AnalysisResult;
  onNavigate: (sectionId: string) => void;
}

export const DocumentNavigator: React.FC<DocumentNavigatorProps> = ({
  result,
  onNavigate,
}) => {
  const sections = [
    {
      id: 'section-overview',
      label: 'Overview',
      icon: FileText,
      count: null,
      badgeColor: 'bg-stone-100 text-stone-700',
    },
    {
      id: 'section-attention',
      label: 'Review Items',
      icon: ShieldAlert,
      count: result.attention_items?.length || 0,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
      show: (result.attention_items?.length || 0) > 0,
    },
    {
      id: 'section-dates',
      label: 'Important Dates',
      icon: Calendar,
      count: result.important_dates?.length || 0,
      badgeColor: 'bg-stone-100 text-stone-700',
      show: (result.important_dates?.length || 0) > 0,
    },
    {
      id: 'section-financial',
      label: 'Financial Terms',
      icon: DollarSign,
      count: result.financial_obligations?.length || 0,
      badgeColor: 'bg-stone-100 text-stone-700',
      show: (result.financial_obligations?.length || 0) > 0,
    },
    {
      id: 'section-obligations',
      label: 'Key Obligations',
      icon: CheckSquare,
      count: result.key_obligations?.length || 0,
      badgeColor: 'bg-stone-100 text-stone-700',
      show: (result.key_obligations?.length || 0) > 0,
    },
    {
      id: 'section-termination',
      label: 'Termination & Exit',
      icon: LogOut,
      count: null,
      badgeColor: 'bg-stone-100 text-stone-700',
    },
    {
      id: 'section-qa',
      label: 'Ask Document',
      icon: MessageSquareQuote,
      count: null,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      highlight: true,
    },
  ];

  return (
    <nav
      id="document-navigator"
      aria-label="Explore this document navigation"
      className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 shadow-2xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-stone-700" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Explore this document
          </h2>
        </div>
        <span className="text-[11px] text-stone-500">
          Jump directly to key provisions, clauses, or grounded Q&A
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sections
          .filter((item) => item.show !== false)
          .map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors border shadow-2xs focus:outline-none focus:ring-2 focus:ring-stone-400 ${
                  item.highlight
                    ? 'bg-white border-emerald-300 text-emerald-950 hover:bg-emerald-50/60'
                    : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-100/80 hover:text-stone-900'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    item.highlight ? 'text-emerald-700' : 'text-stone-500'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${item.badgeColor}`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </nav>
  );
};
