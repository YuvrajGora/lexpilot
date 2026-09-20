from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..models.analysis import AnalysisResult
from ..utils.validation import validate_file, validate_extracted_text
from ..services.extractor_service import extract_document_text
from ..services.gemini_service import GeminiService

router = APIRouter(tags=["analysis"])

ai_service = GeminiService()

@router.post("/analyze", response_model=AnalysisResult)
@router.post("/api/analyze", response_model=AnalysisResult)
async def analyze_document(file: UploadFile = File(...)):
    """
    Accepts a legal document (PDF, DOCX, or TXT), extracts and validates content,
    performs structured, source-grounded Gemini analysis, and returns verified results.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No document file provided."
        )

    # 1. Read file bytes safely
    try:
        contents = await file.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read the uploaded document."
        )

    # 2. Validate file (extension, size, empty file)
    ext = validate_file(file.filename, len(contents))

    # 3. Extract text
    raw_text = extract_document_text(contents, ext)

    # 4. Validate extracted text
    validated_text = validate_extracted_text(raw_text)

    # 5. Perform Gemini analysis
    analysis_result = await ai_service.analyze_legal_document(validated_text)
    analysis_result.extracted_text = validated_text

    # 6. Return validated structured result
    return analysis_result
