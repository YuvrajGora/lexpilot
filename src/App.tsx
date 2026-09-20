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
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [comparisonStatus, setComparisonStatus] = useState<ComparisonStatus>('idle');
  const [comparisonStatusMessage, setComparisonStatusMessage] = useState<string>('');
  const [comparisonErrorMessage, setComparisonErrorMessage] = useState<string>('');
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Check immediately at startup. Once healthy, avoid an always-on polling
  // timer; focus/visibility events still provide lightweight recovery checks.
  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 2000;

    const verifyHealth = async () => {
      try {
        const res = await checkBackendHealth();
        if (!isMounted) return;
        if (res.status === 'healthy') {
          setIsBackendConnected(true);
          retryDelay = 2000;
        } else {
          setIsBackendConnected(false);
        }
      } catch {
        if (!isMounted) return;
        setIsBackendConnected(false);
        retryTimer = setTimeout(verifyHealth, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 60000);
      }
    };

    const checkWhenActive = () => {
      if (document.visibilityState === 'visible') void verifyHealth();
    };

    void verifyHealth();
    window.addEventListener('focus', checkWhenActive);
    document.addEventListener('visibilitychange', checkWhenActive);
    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener('focus', checkWhenActive);
      document.removeEventListener('visibilitychange', checkWhenActive);
    };
  }, []);

  const handleStartAnalysis = () => setCurrentView('upload');

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
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during analysis.');
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

  const handleStartComparison = () => setCurrentView('compare-workspace');

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
      setComparisonErrorMessage(err instanceof Error ? err.message : 'An error occurred during document comparison.');
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

  const activeMode = currentView === 'compare-workspace' || currentView === 'compare-results'
    ? 'compare'
    : currentView === 'upload' || currentView === 'results' ? 'analyze' : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 font-sans text-stone-900 selection:bg-amber-100 selection:text-stone-900">
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
      <main className="flex-1">
        {currentView === 'landing' && <LandingHero onStartAnalysis={handleStartAnalysis} onStartComparison={handleStartComparison} />}
        {currentView === 'upload' && <DocumentUpload onAnalyze={handleDocumentAnalyze} status={status} statusMessage={statusMessage} errorMessage={errorMessage} onReset={handleResetAnalysis} />}
        {currentView === 'results' && analysisResult && <ResultsDashboard result={analysisResult} fileName={currentFile?.name || 'Uploaded Document'} onNewAnalysis={handleNewAnalysis} />}
        {currentView === 'compare-workspace' && <DocumentComparisonWorkspace onCompare={handleCompareDocuments} status={comparisonStatus} statusMessage={comparisonStatusMessage} errorMessage={comparisonErrorMessage} onReset={handleResetComparison} onBackToSingleAnalyze={() => setCurrentView('upload')} />}
        {currentView === 'compare-results' && comparisonResult && <ComparisonResultsDashboard result={comparisonResult} docAName={fileA?.name || 'Document A'} docBName={fileB?.name || 'Document B'} onNewComparison={handleNewComparison} onNavigateToSingleAnalyze={() => setCurrentView('upload')} />}
      </main>
      <Footer />
    </div>
  );
}
