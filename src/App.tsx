import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { DocumentUpload } from './components/DocumentUpload';
import { ResultsDashboard } from './components/ResultsDashboard';
import { DocumentComparisonWorkspace } from './components/DocumentComparisonWorkspace';
import { ComparisonResultsDashboard } from './components/ComparisonResultsDashboard';
import { Footer } from './components/Footer';
import { AnalysisResult, ProcessingStatus } from './types/analysis';
import { ComparisonResult, ComparisonStatus } from './types/comparison';
import { analyzeDocument, compareDocuments, checkBackendHealth } from './services/api';

type ActiveView = 'landing' | 'upload' | 'results' | 'compare-workspace' | 'compare-results';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('landing');
  
  // Single document analysis state
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Document comparison state
  const [comparisonStatus, setComparisonStatus] = useState<ComparisonStatus>('idle');
  const [comparisonStatusMessage, setComparisonStatusMessage] = useState<string>('');
  const [comparisonErrorMessage, setComparisonErrorMessage] = useState<string>('');
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Check health of backend on load
  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      try {
        const res = await checkBackendHealth();
        if (isMounted && res.status === 'healthy') {
          setIsBackendConnected(true);
        }
      } catch (e) {
        if (isMounted) {
          setIsBackendConnected(false);
        }
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Single document navigation & handlers
  const handleStartAnalysis = () => {
    setCurrentView('upload');
  };

  const handleDocumentAnalyze = async (file: File) => {
    setCurrentFile(file);
    setStatus('reading');
    setStatusMessage('Reading document and extracting text...');
    setErrorMessage('');

    try {
      setTimeout(() => {
        setStatus('analyzing');
        setStatusMessage('Grounding clauses and generating structured analysis...');
      }, 700);

      const result = await analyzeDocument(file);
      setAnalysisResult(result);
      setStatus('success');
      setStatusMessage('Analysis complete');
      setCurrentView('results');
    } catch (err: unknown) {
      setStatus('error');
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during analysis.';
      setErrorMessage(errorMsg);
    }
  };

  const handleResetAnalysis = () => {
    setStatus('idle');
    setStatusMessage('');
    setErrorMessage('');
    setCurrentFile(null);
  };

  const handleNewAnalysis = () => {
    handleResetAnalysis();
    setAnalysisResult(null);
    setCurrentView('upload');
  };

  // Comparison navigation & handlers
  const handleStartComparison = () => {
    setCurrentView('compare-workspace');
  };

  const handleCompareDocuments = async (uploadedA: File, uploadedB: File) => {
    setFileA(uploadedA);
    setFileB(uploadedB);
    setComparisonStatus('reading');
    setComparisonStatusMessage('Extracting text from Document A and Document B...');
    setComparisonErrorMessage('');

    try {
      setTimeout(() => {
        setComparisonStatus('comparing');
        setComparisonStatusMessage('Comparing clauses and generating grounded differences...');
      }, 800);

      const result = await compareDocuments(uploadedA, uploadedB);
      setComparisonResult(result);
      setComparisonStatus('success');
      setComparisonStatusMessage('Comparison complete');
      setCurrentView('compare-results');
    } catch (err: unknown) {
      setComparisonStatus('error');
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during document comparison.';
      setComparisonErrorMessage(errorMsg);
    }
  };

  const handleResetComparison = () => {
    setComparisonStatus('idle');
    setComparisonStatusMessage('');
    setComparisonErrorMessage('');
    setFileA(null);
    setFileB(null);
  };

  const handleNewComparison = () => {
    handleResetComparison();
    setComparisonResult(null);
    setCurrentView('compare-workspace');
  };

  const activeMode =
    currentView === 'compare-workspace' || currentView === 'compare-results'
      ? 'compare'
      : currentView === 'upload' || currentView === 'results'
      ? 'analyze'
      : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 font-sans text-stone-900 selection:bg-amber-100 selection:text-stone-900">
      {/* Universal Navigation Header */}
      <Header
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateToUpload={() => setCurrentView('upload')}
        onNavigateToCompare={handleStartComparison}
        hasActiveAnalysis={analysisResult !== null}
        hasActiveComparison={comparisonResult !== null}
        onViewResults={() => setCurrentView('results')}
        onViewComparisonResults={() => setCurrentView('compare-results')}
        isBackendConnected={isBackendConnected}
        activeMode={activeMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingHero
            onStartAnalysis={handleStartAnalysis}
            onStartComparison={handleStartComparison}
          />
        )}

        {currentView === 'upload' && (
          <DocumentUpload
            onAnalyze={handleDocumentAnalyze}
            status={status}
            statusMessage={statusMessage}
            errorMessage={errorMessage}
            onReset={handleResetAnalysis}
          />
        )}

        {currentView === 'results' && analysisResult && (
          <ResultsDashboard
            result={analysisResult}
            fileName={currentFile?.name || 'Uploaded Document'}
            onNewAnalysis={handleNewAnalysis}
          />
        )}

        {currentView === 'compare-workspace' && (
          <DocumentComparisonWorkspace
            onCompare={handleCompareDocuments}
            status={comparisonStatus}
            statusMessage={comparisonStatusMessage}
            errorMessage={comparisonErrorMessage}
            onReset={handleResetComparison}
            onBackToSingleAnalyze={() => setCurrentView('upload')}
          />
        )}

        {currentView === 'compare-results' && comparisonResult && (
          <ComparisonResultsDashboard
            result={comparisonResult}
            docAName={fileA?.name || 'Document A'}
            docBName={fileB?.name || 'Document B'}
            onNewComparison={handleNewComparison}
            onNavigateToSingleAnalyze={() => setCurrentView('upload')}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}

