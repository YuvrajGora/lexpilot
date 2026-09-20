import { AnalysisResult } from '../types/analysis';
import { ComparisonResult } from '../types/comparison';
import { QAResponse } from '../types/qa';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function checkBackendHealth(): Promise<{ status: string; service: string; gemini_configured: boolean }> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    return await response.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unable to connect to LexPilot backend server.';
    throw new ApiError(msg, 503);
  }
}

export async function analyzeDocument(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });
  } catch (err: unknown) {
    throw new ApiError(
      'Unable to connect to the analysis service. Please verify the backend is running.',
      503
    );
  }

  if (!response.ok) {
    let errorDetail = 'Analysis failed. Please try again.';
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorDetail = errorData.detail;
      }
    } catch {
      // response is not JSON
      errorDetail = `Server error (${response.status}: ${response.statusText})`;
    }
    throw new ApiError(errorDetail, response.status);
  }

  const data = await response.json();
  return data as AnalysisResult;
}

export async function compareDocuments(fileA: File, fileB: File): Promise<ComparisonResult> {
  const formData = new FormData();
  formData.append('file_a', fileA);
  formData.append('file_b', fileB);

  let response: Response;
  try {
    response = await fetch('/api/compare', {
      method: 'POST',
      body: formData,
    });
  } catch (err: unknown) {
    throw new ApiError(
      'Unable to connect to the comparison service. Please verify the backend is running.',
      503
    );
  }

  if (!response.ok) {
    let errorDetail = 'Comparison failed. Please try again.';
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorDetail = errorData.detail;
      }
    } catch {
      errorDetail = `Server error (${response.status}: ${response.statusText})`;
    }
    throw new ApiError(errorDetail, response.status);
  }

  const data = await response.json();
  return data as ComparisonResult;
}

export async function askDocumentQuestion(documentText: string, question: string): Promise<QAResponse> {
  let response: Response;
  try {
    response = await fetch('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_text: documentText,
        question: question.trim(),
      }),
    });
  } catch (err: unknown) {
    throw new ApiError(
      'Unable to connect to the Q&A service. Please verify the backend is running.',
      503
    );
  }

  if (!response.ok) {
    let errorDetail = 'Failed to answer question. Please try again.';
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorDetail = errorData.detail;
      }
    } catch {
      errorDetail = `Server error (${response.status}: ${response.statusText})`;
    }
    throw new ApiError(errorDetail, response.status);
  }

  const data = await response.json();
  return data as QAResponse;
}

