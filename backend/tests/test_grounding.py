import os
import asyncio
import pytest
from backend.app.services.gemini_service import GeminiService, SYSTEM_INSTRUCTION

def test_system_prompt_strict_grounding_rules():
    """Verify that system prompt explicitly forbids inventing parties or rights."""
    assert "STRICT DOCUMENT GROUNDING (NO INFERENCES)" in SYSTEM_INSTRUCTION
    assert "Termination requires 60 days' notice" in SYSTEM_INSTRUCTION
    assert "either party" in SYSTEM_INSTRUCTION
    assert "Do not state that a specific party (or \"either party\") has termination rights" in SYSTEM_INSTRUCTION
    assert "Do not label something as a risk merely because it is unusual" in SYSTEM_INSTRUCTION
    assert "Not specified in the document." in SYSTEM_INSTRUCTION

def test_termination_grounding_no_invented_parties():
    """
    Test the grounding case:
    Input: 'Termination requires 60 days\\' notice.'
    Expected:
    - notice period = 60 days
    - no specific terminating party should be invented
    - no unsupported termination right should be generated
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        pytest.skip("GEMINI_API_KEY not configured for live LLM grounding test.")

    service = GeminiService()
    input_text = "Termination requires 60 days' notice."
    
    try:
        result = asyncio.run(service.analyze_legal_document(input_text))
    except Exception as exc:
        if "502" in str(exc) or "503" in str(exc) or "high demand" in str(exc).lower():
            pytest.skip(f"Live Gemini API temporarily unavailable (503/502): {exc}")
        raise
    
    # 1. notice period = 60 days
    assert "60" in result.termination.notice_period
    assert "day" in result.termination.notice_period.lower()
    
    # 2. no specific terminating party should be invented
    summary_lower = result.termination.summary.lower()
    assert "either party" not in summary_lower, f"Inferred 'either party' in summary: {result.termination.summary}"
    assert "both parties" not in summary_lower, f"Inferred 'both parties' in summary: {result.termination.summary}"
    assert len(result.parties) == 0, f"Invented parties: {result.parties}"
    
    # 3. no unsupported termination right should be generated
    for cond in result.termination.conditions:
        cond_lower = cond.lower()
        assert "either party" not in cond_lower
        assert "both parties" not in cond_lower
