import asyncio

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..models.comparison import ComparisonResult
from ..utils.validation import validate_file, validate_extracted_text
from ..services.extractor_service import extract_document_text
from ..services.gemini_service import GeminiService

router = APIRouter(tags=["comparison"])

ai_service = GeminiService()

@router.post("/compare", response_model=ComparisonResult)
@router.post("/api/compare", response_model=ComparisonResult)
async def compare_documents(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...)
):
    """
    Accepts two legal documents (PDF, DOCX, or TXT), extracts and validates content,
    performs structured, source-grounded comparison, and returns verified differences.
    """
    if not file_a.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document A filename is missing or invalid."
        )
    if not file_b.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document B filename is missing or invalid."
        )

    # 1. Read file bytes safely
    try:
        contents_a = await file_a.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read Document A."
        )

    try:
        contents_b = await file_b.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read Document B."
        )

    # 2. Validate files (extension, size, empty file)
    try:
        ext_a = validate_file(file_a.filename, len(contents_a))
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=f"Document A validation error: {e.detail}"
        )

    try:
        ext_b = validate_file(file_b.filename, len(contents_b))
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=f"Document B validation error: {e.detail}"
        )

    # 3. Extract the independent documents concurrently in the bounded
    # default asyncio executor rather than blocking the event loop or waiting
    # for Document A before starting Document B.
    raw_text_a, raw_text_b = await asyncio.gather(
        asyncio.to_thread(extract_document_text, contents_a, ext_a),
        asyncio.to_thread(extract_document_text, contents_b, ext_b),
    )

    # 4. Validate extracted text
    try:
        validated_text_a = validate_extracted_text(raw_text_a)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=f"Document A text extraction error: {e.detail}"
        )

    try:
        validated_text_b = validate_extracted_text(raw_text_b)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=f"Document B text extraction error: {e.detail}"
        )

    # 5. Perform comparison
    comparison_result = await ai_service.compare_legal_documents(
        text_a=validated_text_a,
        text_b=validated_text_b,
        doc_a_name=file_a.filename,
        doc_b_name=file_b.filename,
    )

    return comparison_result
