import io
import pytest
from fastapi import HTTPException
from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, NameObject, DictionaryObject
import docx

import backend.app.services.extractor_service as extractor_module
from backend.app.services.extractor_service import (
    extract_document_text,
    extract_text_from_txt,
    extract_text_from_pdf,
    extract_text_from_docx,
    OCR_PROMPT,
    MAX_OCR_PAGES,
)

def make_text_pdf(pages_text: list[str]) -> bytes:
    """Helper to generate an in-memory PDF with specified text per page."""
    writer = PdfWriter()
    for text in pages_text:
        page = writer.add_blank_page(width=400, height=400)
        if text:
            stream = DecodedStreamObject()
            stream.set_data(f"BT /F1 12 Tf 50 250 Td ({text}) Tj ET".encode("utf-8"))
            page[NameObject("/Contents")] = writer._add_object(stream)
            font = DictionaryObject({
                NameObject("/Type"): NameObject("/Font"),
                NameObject("/Subtype"): NameObject("/Type1"),
                NameObject("/BaseFont"): NameObject("/Helvetica"),
            })
            fonts = DictionaryObject({NameObject("/F1"): writer._add_object(font)})
            page[NameObject("/Resources")] = DictionaryObject({NameObject("/Font"): fonts})
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()

def make_blank_pdf(num_pages: int = 1) -> bytes:
    """Helper to generate an in-memory PDF with blank canvas pages."""
    writer = PdfWriter()
    for _ in range(num_pages):
        writer.add_blank_page(width=400, height=400)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()

# --- Existing Tests (Preserved) ---

def test_extract_txt_valid_utf8():
    content = "Standard Non-Disclosure Agreement between Acme Corp and Beta LLC.".encode("utf-8")
    extracted = extract_document_text(content, ".txt")
    assert "Acme Corp" in extracted

def test_extract_txt_fallback_encoding():
    content = "Special clause with accents: Société Générale and résumé.".encode("latin-1")
    extracted = extract_document_text(content, ".txt")
    assert "Société" in extracted

def test_extract_unsupported_format():
    with pytest.raises(HTTPException) as exc_info:
        extract_document_text(b"some content", ".zip")
    assert exc_info.value.status_code == 400

# --- New Scanned-PDF, OCR and Mixed Document Tests ---

def test_extract_pdf_digital_text_preserves_page_markers_no_ocr(monkeypatch):
    """
    Verifies that a digital PDF extracts clean text with page boundaries
    and does NOT invoke OCR.
    """
    ocr_called = []
    def fail_if_ocr_called(page_bytes, page_num=1):
        ocr_called.append(page_num)
        return "OCR Text"

    monkeypatch.setattr(extractor_module, "ocr_pdf_page", fail_if_ocr_called)

    pdf_bytes = make_text_pdf([
        "Page 1: Commercial Lease Agreement between Landlord and Tenant.",
        "Page 2: Monthly rent shall be $4,500 due on the first day of each month."
    ])

    extracted = extract_document_text(pdf_bytes, ".pdf")
    assert len(ocr_called) == 0, "OCR should not be called for text-based PDF pages"
    assert "--- Page 1 ---" in extracted
    assert "Commercial Lease Agreement" in extracted
    assert "--- Page 2 ---" in extracted
    assert "Monthly rent shall be $4,500" in extracted

def test_extract_pdf_scanned_ocr_fallback(monkeypatch):
    """
    Verifies that a scanned PDF with no extractable text is routed to OCR
    and retains page boundaries.
    """
    scanned_pages_called = []
    def mock_ocr(page_bytes, page_num=1):
        scanned_pages_called.append(page_num)
        return f"Scanned page {page_num} legal content: Mutual Non-Disclosure Obligations."

    monkeypatch.setattr(extractor_module, "ocr_pdf_page", mock_ocr)

    scanned_pdf_bytes = make_blank_pdf(num_pages=2)
    extracted = extract_document_text(scanned_pdf_bytes, ".pdf")

    assert scanned_pages_called == [1, 2]
    assert "--- Page 1 ---" in extracted
    assert "Scanned page 1 legal content" in extracted
    assert "--- Page 2 ---" in extracted
    assert "Scanned page 2 legal content" in extracted

def test_extract_pdf_mixed_text_and_scanned(monkeypatch):
    """
    Verifies mixed PDFs: Page 1 has digital text, Page 2 is scanned.
    OCR is invoked only for Page 2.
    """
    ocr_invocations = []
    def mock_ocr(page_bytes, page_num=1):
        ocr_invocations.append(page_num)
        return "Executed by Jane Doe, Authorized Signatory, on behalf of Beta Corp."

    monkeypatch.setattr(extractor_module, "ocr_pdf_page", mock_ocr)

    mixed_pdf_bytes = make_text_pdf([
        "Page 1: Master Services Agreement clauses and warranty terms.",
        ""  # Page 2 has no extractable text stream
    ])

    extracted = extract_document_text(mixed_pdf_bytes, ".pdf")

    assert ocr_invocations == [2], f"OCR should only be invoked for page 2, got {ocr_invocations}"
    assert "--- Page 1 ---" in extracted
    assert "Master Services Agreement" in extracted
    assert "--- Page 2 ---" in extracted
    assert "Authorized Signatory" in extracted

def test_extract_pdf_blank_document_raises_422(monkeypatch):
    """
    Verifies that a blank document where OCR yields no text raises HTTP 422.
    """
    monkeypatch.setattr(extractor_module, "ocr_pdf_page", lambda pb, pn=1: "")

    blank_pdf = make_blank_pdf(num_pages=1)
    with pytest.raises(HTTPException) as exc_info:
        extract_document_text(blank_pdf, ".pdf")
    assert exc_info.value.status_code == 422
    assert "could not be read or does not contain extractable text" in exc_info.value.detail

def test_extract_pdf_unreadable_scan_raises_422(monkeypatch):
    """
    Verifies that an unreadable scan returning [NO_READABLE_TEXT] raises HTTP 422.
    """
    monkeypatch.setattr(extractor_module, "ocr_pdf_page", lambda pb, pn=1: "")

    unreadable_pdf = make_blank_pdf(num_pages=2)
    with pytest.raises(HTTPException) as exc_info:
        extract_document_text(unreadable_pdf, ".pdf")
    assert exc_info.value.status_code == 422

def test_extract_pdf_oversized_scanned_pages_rejected():
    """
    Verifies that a document with scanned pages exceeding MAX_OCR_PAGES is rejected with HTTP 400.
    """
    oversized_pdf = make_blank_pdf(num_pages=MAX_OCR_PAGES + 1)
    with pytest.raises(HTTPException) as exc_info:
        extract_document_text(oversized_pdf, ".pdf")
    assert exc_info.value.status_code == 400
    assert "exceeding the maximum OCR limit" in exc_info.value.detail

def test_extract_pdf_missing_gemini_key_raises_503(monkeypatch):
    """
    Verifies that when a scanned PDF requires OCR but GEMINI_API_KEY is unset, HTTP 503 is returned.
    """
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    scanned_pdf = make_blank_pdf(num_pages=1)

    with pytest.raises(HTTPException) as exc_info:
        extract_document_text(scanned_pdf, ".pdf")
    assert exc_info.value.status_code == 503
    assert "GEMINI_API_KEY is not configured" in exc_info.value.detail

def test_extract_pdf_corrupted_raises_422():
    """
    Verifies that corrupted PDF bytes raise HTTP 422 cleanly.
    """
    corrupt_bytes = b"%PDF-1.4\n%corrupted-non-pdf-binary-trash"
    with pytest.raises(HTTPException) as exc_info:
        extract_document_text(corrupt_bytes, ".pdf")
    assert exc_info.value.status_code == 422
    assert "could not be read or does not contain extractable text" in exc_info.value.detail

def test_extract_docx_paragraphs_and_tables():
    """
    Verifies DOCX extraction handles paragraphs and tables.
    """
    doc = docx.Document()
    doc.add_paragraph("This is paragraph one of the Employment Agreement.")
    table = doc.add_table(rows=1, cols=2)
    row_cells = table.rows[0].cells
    row_cells[0].text = "Salary"
    row_cells[1].text = "$120,000 per annum"

    buf = io.BytesIO()
    doc.save(buf)
    docx_bytes = buf.getvalue()

    extracted = extract_document_text(docx_bytes, ".docx")
    assert "Employment Agreement" in extracted
    assert "Salary | $120,000 per annum" in extracted

def test_ocr_prompt_anti_hallucination_rules():
    """
    Verifies that OCR transcription prompt explicitly prohibits hallucinating missing text.
    """
    assert "Transcribe ONLY the text that visibly appears" in OCR_PROMPT
    assert "Do NOT summarize, correct grammar, interpret, analyze" in OCR_PROMPT
    assert "[NO_READABLE_TEXT]" in OCR_PROMPT
    assert "Never invent, infer, or hallucinate text" in OCR_PROMPT
