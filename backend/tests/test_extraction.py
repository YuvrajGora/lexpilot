import pytest
from fastapi import HTTPException
from backend.app.services.extractor_service import extract_document_text, extract_text_from_txt

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
