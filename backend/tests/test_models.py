import pytest
from pydantic import ValidationError
from backend.app.models.analysis import AnalysisResult, Party, TerminationClause

def test_valid_analysis_result():
    data = {
        "document_type": "Mutual Non-Disclosure Agreement",
        "summary": "Standard agreement protecting confidential information exchanged between parties.",
        "parties": [
            {"name": "Alpha Corp", "role": "Disclosing Party"},
            {"name": "Beta Inc", "role": "Receiving Party"}
        ],
        "important_dates": [
            {"date": "2026-01-01", "description": "Effective Date"}
        ],
        "financial_obligations": [
            {
                "description": "Late payment penalty",
                "amount": "$50 per day",
                "frequency": "Per day",
                "source_text": "A late penalty of $50 per day shall apply."
            }
        ],
        "key_obligations": [
            {
                "party": "Beta Inc",
                "obligation": "Maintain strict confidentiality of proprietary data.",
                "source_text": "Receiving Party shall safeguard all proprietary items."
            }
        ],
        "termination": {
            "summary": "Either party may terminate upon written notice.",
            "notice_period": "30 days",
            "conditions": ["Written notice delivered to primary address"],
            "source_text": "Either party may terminate with thirty (30) days prior written notice."
        },
        "attention_items": [
            {
                "title": "Indemnity Clause",
                "severity": "attention",
                "explanation": "Clause requires broad uncapped indemnification.",
                "source_text": "Beta agrees to indemnify and hold harmless Alpha Corp."
            }
        ]
    }
    result = AnalysisResult.model_validate(data)
    assert result.document_type == "Mutual Non-Disclosure Agreement"
    assert len(result.parties) == 2
    assert result.termination.notice_period == "30 days"

def test_malformed_response_rejected():
    # Missing required termination field
    malformed_data = {
        "document_type": "NDA",
        "summary": "Summary here"
        # missing termination, parties, etc.
    }
    with pytest.raises(ValidationError):
        AnalysisResult.model_validate(malformed_data)
