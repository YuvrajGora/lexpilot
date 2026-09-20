import pytest
from fastapi import HTTPException
from backend.app.utils.validation import validate_file, validate_extracted_text, MAX_FILE_SIZE

def test_valid_file_extensions():
    assert validate_file("document.pdf", 1000) == ".pdf"
    assert validate_file("contract.DOCX", 2000) == ".docx"
    assert validate_file("agreement.txt", 500) == ".txt"

def test_unsupported_file_extension():
    with pytest.raises(HTTPException) as exc_info:
        validate_file("malicious.exe", 1000)
    assert exc_info.value.status_code == 400
    assert "Unsupported file type" in exc_info.value.detail

def test_empty_file_rejected():
    with pytest.raises(HTTPException) as exc_info:
        validate_file("contract.pdf", 0)
    assert exc_info.value.status_code == 400
    assert "empty" in exc_info.value.detail.lower()

def test_oversized_file_rejected():
    with pytest.raises(HTTPException) as exc_info:
        validate_file("huge.pdf", MAX_FILE_SIZE + 1)
    assert exc_info.value.status_code == 400
    assert "exceeds" in exc_info.value.detail.lower()

def test_validate_extracted_text_valid():
    sample = "This Non-Disclosure Agreement is made and entered into on this day."
    assert validate_extracted_text(sample) == sample

def test_validate_extracted_text_empty_or_whitespace():
    with pytest.raises(HTTPException) as exc_info:
        validate_extracted_text("   \n\t  ")
    assert exc_info.value.status_code == 422
    assert "could not be read or does not contain extractable text" in exc_info.value.detail

def test_validate_extracted_text_too_short():
    with pytest.raises(HTTPException) as exc_info:
        validate_extracted_text("Hi")
    assert exc_info.value.status_code == 422
    assert "could not be read or does not contain extractable text" in exc_info.value.detail
