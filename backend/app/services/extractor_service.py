import io
import logging
import os
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

def extract_text_from_txt(file_bytes: bytes) -> str:
    """Safely extracts text from TXT using UTF-8, falling back to latin-1."""
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            return file_bytes.decode("latin-1")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Unable to decode TXT file. Please ensure it is text-encoded."
            )

MAX_OCR_PAGES = 30  # Safety threshold for scanned pages
MIN_TEXT_CHARS_PER_PAGE = 20  # Threshold to treat a page as text-extracted

OCR_PROMPT = """You are an optical character recognition (OCR) transcription engine for legal documents.
Transcribe all readable text from this document page verbatim.

CRITICAL TRANSCRIPTION RULES:
1. Transcribe ONLY the text that visibly appears on this document page. Preserve exact wording, numbers, dates, currency symbols, and layout structure.
2. Do NOT summarize, correct grammar, interpret, analyze, or add commentary.
3. Do NOT add markdown introductions, conversational preambles (such as "Here is the transcribed text:"), or explanations.
4. If the page contains no readable text, is blank, or contains only unreadable marks/noise, return exactly: [NO_READABLE_TEXT]
5. Never invent, infer, or hallucinate text that is not visibly present on the page.
"""

def ocr_pdf_page(page_bytes: bytes, page_num: int = 1) -> str:
    """
    Performs optical character recognition (OCR) on a single PDF page using Google GenAI SDK.
    Safe against prompt injection, never hallucinates text, and respects API timeouts.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Document contains scanned pages requiring OCR, but GEMINI_API_KEY is not configured."
        )

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google GenAI SDK is not available for OCR processing."
        )

    candidate_models = [
        os.environ.get("GEMINI_OCR_MODEL"),
        os.environ.get("GEMINI_MODEL"),
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
    ]
    candidate_models = [m for m in candidate_models if m]

    client = genai.Client(api_key=api_key)
    part = types.Part.from_bytes(data=page_bytes, mime_type="application/pdf")

    last_exc = None
    for model_name in candidate_models:
        try:
            config = types.GenerateContentConfig(
                temperature=0.0,
            )
            response = client.models.generate_content(
                model=model_name,
                contents=[part, OCR_PROMPT],
                config=config,
            )
            raw_text = (response.text or "").strip()
            if raw_text == "[NO_READABLE_TEXT]":
                return ""
            if raw_text.startswith("```") and raw_text.endswith("```"):
                lines = raw_text.splitlines()
                raw_text = "\n".join(lines[1:-1]).strip()
                if raw_text == "[NO_READABLE_TEXT]":
                    return ""
            return raw_text
        except Exception as e:
            last_exc = e
            logger.warning(
                f"OCR attempt failed with model {model_name} on page {page_num}: {type(e).__name__}"
            )

    err_msg = str(last_exc) if last_exc else "OCR request failed"
    if "quota" in err_msg.lower() or "429" in err_msg:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI rate limit or quota exceeded during OCR processing."
        )
    elif "API_KEY" in err_msg or "403" in err_msg or "unauthorized" in err_msg.lower():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI authentication failed during OCR processing."
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to extract text from scanned document via OCR. Please try again."
        )

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from PDF pages using pypdf, falling back to Gemini OCR for scanned
    or image-based pages. Preserves page boundaries and numbers.
    """
    try:
        from pypdf import PdfReader, PdfWriter
        stream = io.BytesIO(file_bytes)
        reader = PdfReader(stream)

        total_pages = len(reader.pages)
        if total_pages == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The document could not be read or does not contain extractable text."
            )

        page_texts: dict[int, str] = {}
        pages_needing_ocr: list[int] = []

        for idx, page in enumerate(reader.pages):
            try:
                extracted = (page.extract_text() or "").strip()
            except Exception:
                extracted = ""

            if len(extracted) >= MIN_TEXT_CHARS_PER_PAGE:
                page_texts[idx] = extracted
            else:
                pages_needing_ocr.append(idx)

        # If some or all pages lack extractable text, route them through OCR
        if pages_needing_ocr:
            if len(pages_needing_ocr) > MAX_OCR_PAGES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Document contains {len(pages_needing_ocr)} scanned pages, exceeding the maximum OCR limit of {MAX_OCR_PAGES} pages."
                )

            for idx in pages_needing_ocr:
                page = reader.pages[idx]
                writer = PdfWriter()
                writer.add_page(page)
                page_buf = io.BytesIO()
                writer.write(page_buf)
                single_page_bytes = page_buf.getvalue()

                ocr_text = ocr_pdf_page(single_page_bytes, page_num=idx + 1)
                if ocr_text and ocr_text.strip():
                    page_texts[idx] = ocr_text.strip()

        # Format document output with page boundaries and page numbers
        extracted_blocks = []
        for idx in range(total_pages):
            text = page_texts.get(idx)
            if text and text.strip():
                extracted_blocks.append(f"--- Page {idx + 1} ---\n{text.strip()}")

        result = "\n\n".join(extracted_blocks)
        if not result.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The document could not be read or does not contain extractable text."
            )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF extraction error: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The document could not be read or does not contain extractable text."
        )

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts text from DOCX paragraphs and tables using python-docx."""
    try:
        import docx
        stream = io.BytesIO(file_bytes)
        doc = docx.Document(stream)
        
        extracted = []
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:
                extracted.append(text)
                
        for table in doc.tables:
            for row in table.rows:
                row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_texts:
                    extracted.append(" | ".join(row_texts))
                    
        return "\n\n".join(extracted)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The document could not be read or does not contain extractable text."
        )

def extract_document_text(file_bytes: bytes, extension: str) -> str:
    """Dispatches text extraction based on file extension."""
    ext = extension.lower()
    if ext == ".txt":
        return extract_text_from_txt(file_bytes)
    elif ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == ".docx":
        return extract_text_from_docx(file_bytes)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: {ext}"
        )
