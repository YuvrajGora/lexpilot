import io
import os
import zipfile
from fastapi import HTTPException, status

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_magic_bytes(file_bytes: bytes, ext: str) -> None:
    """
    Verifies the actual file signature/header bytes before accepting uploads.
    - PDF: must begin with the PDF magic signature %PDF-
    - DOCX: must be a valid ZIP container beginning with PK ZIP signature
            and containing the expected Office Open XML structure ([Content_Types].xml, word/document.xml).
    - TXT: must be valid text encodable as UTF-8 or Latin-1; rejects null-byte binaries.
    """
    if ext == ".pdf":
        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file format. The file header does not match a valid PDF document."
            )
    elif ext == ".docx":
        # ZIP magic signature is typically b"PK\x03\x04" or b"PK\x05\x06" / b"PK\x07\x08"
        if not file_bytes.startswith(b"PK"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid DOCX file format. The file is not a valid ZIP-based Office Open XML container."
            )
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
                namelist = zf.namelist()
                # Verify standard Office Open XML DOCX package structure:
                # Must contain [Content_Types].xml and exact word/document.xml
                has_content_types = "[Content_Types].xml" in namelist
                has_word_doc = "word/document.xml" in namelist
                if not (has_content_types and has_word_doc):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid DOCX file format. Missing standard Word document package structure."
                    )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid DOCX file format. The file cannot be read as a valid Word document."
            )
    elif ext == ".txt":
        # Reject binary files masquerading as text (e.g. contains null bytes)
        if b"\x00" in file_bytes[:1024]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TXT file format. Binary content detected in text file."
            )
        # Verify decoding compatibility with supported encodings (UTF-8 or Latin-1)
        try:
            file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                file_bytes.decode("latin-1")
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid TXT file format. Unable to decode text content."
                )

def validate_file(filename: str | None, file_size: int | None, file_bytes: bytes | None = None) -> str:
    """
    Validates uploaded file extension, existence, size, and magic-byte signature.
    Returns the normalized extension.
    """
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing or invalid."
        )
    
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed formats are PDF, DOCX, and TXT."
        )
    
    if file_size is not None:
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty. Please select a valid document."
            )
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the 10 MB limit. Please upload a smaller document."
            )

    # Perform magic-byte and file signature verification if file content is provided
    if file_bytes is not None and len(file_bytes) > 0:
        validate_magic_bytes(file_bytes, ext)
            
    return ext

def validate_extracted_text(text: str | None) -> str:
    """
    Ensures the extracted text contains meaningful, non-empty legal content.
    """
    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The document could not be read or does not contain extractable text."
        )
    
    # Check if there is enough meaningful character content (e.g. more than 20 characters)
    stripped = text.strip()
    if len(stripped) < 20:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The document could not be read or does not contain extractable text."
        )
        
    return stripped
