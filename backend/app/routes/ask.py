from fastapi import APIRouter, HTTPException, status
from ..models.qa import AskRequest, QAResponse
from ..services.gemini_service import GeminiService

router = APIRouter(tags=["qa"])

ai_service = GeminiService()

@router.post("/ask", response_model=QAResponse)
@router.post("/api/ask", response_model=QAResponse)
async def ask_question(request: AskRequest):
    """
    Answers user questions grounded strictly and exclusively in the provided document text.
    Rejects assumptions, external law extrapolation, and prompt injections.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    if len(request.question.strip()) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question exceeds maximum length limit of 1000 characters."
        )

    if not request.document_text or not request.document_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document text cannot be empty."
        )

    if len(request.document_text) > 100_000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document text exceeds maximum length limit of 100,000 characters."
        )

    response = await ai_service.ask_document_question(
        document_text=request.document_text,
        question=request.question
    )

    return response
