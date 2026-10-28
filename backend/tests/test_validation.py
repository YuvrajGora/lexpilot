import io
import zipfile
import pytest
from fastapi import HTTPException
from backend.app.utils.validation import (
    validate_file,
    validate_magic_bytes,
    validate_extracted_text,
    MAX_FILE_SIZE,
)

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

# --- Magic-byte signature tests ---

def test_valid_pdf_signature_accepted():
    valid_pdf_bytes = b"%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n"
    assert validate_file("valid_contract.pdf", len(valid_pdf_bytes), valid_pdf_bytes) == ".pdf"

def test_invalid_renamed_pdf_rejected():
    fake_pdf_bytes = b"This is just plain text renamed as a PDF file."
    with pytest.raises(HTTPException) as exc_info:
        validate_file("fake.pdf", len(fake_pdf_bytes), fake_pdf_bytes)
    assert exc_info.value.status_code == 400
    assert "Invalid PDF file format" in exc_info.value.detail

def test_valid_docx_zip_structure_accepted():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        zf.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types/>')
        zf.writestr("word/document.xml", '<?xml version="1.0" encoding="UTF-8"?><w:document/>')
    valid_docx_bytes = buffer.getvalue()
    assert validate_file("agreement.docx", len(valid_docx_bytes), valid_docx_bytes) == ".docx"

def test_docx_with_arbitrary_word_xml_without_document_xml_rejected():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        zf.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types/>')
        zf.writestr("word/settings.xml", '<?xml version="1.0" encoding="UTF-8"?><w:settings/>')
    zip_bytes = buffer.getvalue()
    with pytest.raises(HTTPException) as exc_info:
        validate_file("fake_docx.docx", len(zip_bytes), zip_bytes)
    assert exc_info.value.status_code == 400
    assert "Invalid DOCX file format" in exc_info.value.detail

def test_renamed_non_docx_zip_rejected():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        zf.writestr("script.py", "print('hello world')")
        zf.writestr("data.json", "{}")
    arbitrary_zip_bytes = buffer.getvalue()
    with pytest.raises(HTTPException) as exc_info:
        validate_file("arbitrary.docx", len(arbitrary_zip_bytes), arbitrary_zip_bytes)
    assert exc_info.value.status_code == 400
    assert "Invalid DOCX file format" in exc_info.value.detail

def test_invalid_docx_rejected():
    corrupted_bytes = b"PK\x03\x04\x00\x00corrupted non-zip content"
    with pytest.raises(HTTPException) as exc_info:
        validate_file("corrupt.docx", len(corrupted_bytes), corrupted_bytes)
    assert exc_info.value.status_code == 400
    assert "Invalid DOCX file format" in exc_info.value.detail

def test_existing_txt_behavior_accepted():
    valid_utf8_txt = "Non-Disclosure Agreement in UTF-8: Café and naïve.".encode("utf-8")
    assert validate_file("contract.txt", len(valid_utf8_txt), valid_utf8_txt) == ".txt"
    
    valid_latin1_txt = "Latin-1 agreement: Resumé".encode("latin-1")
    assert validate_file("contract.txt", len(valid_latin1_txt), valid_latin1_txt) == ".txt"

def test_txt_with_null_bytes_rejected():
    binary_as_txt = b"Header\x00\x00\x01\x02binary executable content"
    with pytest.raises(HTTPException) as exc_info:
        validate_file("fake.txt", len(binary_as_txt), binary_as_txt)
    assert exc_info.value.status_code == 400
    assert "Invalid TXT file format" in exc_info.value.detail

