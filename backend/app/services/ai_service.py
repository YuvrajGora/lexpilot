from abc import ABC, abstractmethod
from ..models.analysis import AnalysisResult
from ..models.comparison import ComparisonResult
from ..models.qa import QAResponse

class AIService(ABC):
    """Abstract interface for AI analysis providers."""

    @abstractmethod
    async def analyze_legal_document(self, text: str) -> AnalysisResult:
        """Analyzes extracted legal document text and returns structured analysis."""
        pass

    async def compare_legal_documents(
        self, text_a: str, text_b: str, doc_a_name: str = "Document A", doc_b_name: str = "Document B"
    ) -> ComparisonResult:
        """Compares two extracted legal documents and returns structured differences."""
        raise NotImplementedError("compare_legal_documents must be implemented by the service provider.")

    async def ask_document_question(
        self, document_text: str, question: str
    ) -> QAResponse:
        """Answers a user question grounded strictly and exclusively in the provided document text."""
        raise NotImplementedError("ask_document_question must be implemented by the service provider.")
