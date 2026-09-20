import os
from fastapi import HTTPException, status

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_file(filename: str | None, file_size: int | None) -> str:
    """
    Validates uploaded file extension, existence, and size.
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
