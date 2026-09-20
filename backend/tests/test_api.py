import io
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.analysis import AnalysisResult
from backend.app.routes.analyze import ai_service
from backend.app.services.ai_service import AIService

client = TestClient(app)

class MockAIService(AIService):
    async def analyze_legal_document(self, text: str) -> AnalysisResult:
        return AnalysisResult(
            document_type="Commercial Lease Agreement",
            summary="Lease agreement between Landlord and Tenant for office premises.",
            parties=[
                {"name": "Metro Properties", "role": "Landlord"},
                {"name": "LexPilot Inc", "role": "Tenant"}
            ],
            important_dates=[
                {"date": "November 1, 2026", "description": "Commencement Date"}
            ],
            financial_obligations=[
                {
                    "description": "Monthly Base Rent",
                    "amount": "$4,500.00",
                    "frequency": "Monthly",
                    "source_text": "Tenant shall pay Base Rent of $4,500.00 on the first day of each month."
                }
            ],
            key_obligations=[
                {
                    "party": "Tenant",
                    "obligation": "Maintain commercial general liability insurance.",
                    "source_text": "Tenant must maintain liability insurance throughout the term."
                }
            ],
            termination={
                "summary": "Termination upon material breach after 15 days notice.",
                "notice_period": "15 days cure period",
                "conditions": ["Non-payment of rent", "Unauthorized assignment"],
                "source_text": "Landlord may terminate if default continues after 15 days written notice."
            },
            attention_items=[
                {
                    "title": "Automatic Renewal Notice Requirement",
                    "severity": "attention",
                    "explanation": "Lease automatically renews unless cancelled 90 days prior.",
                    "source_text": "Written notice of non-renewal must be served at least 90 days prior to expiration."
                }
            ]
        )

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "LexPilot Backend"

def test_upload_invalid_file_extension():
    file_content = b"Some malicious executable or unsupported file"
    response = client.post(
        "/api/analyze",
        files={"file": ("malicious.exe", file_content, "application/octet-stream")}
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]

def test_upload_empty_file():
    empty_content = b""
    response = client.post(
        "/api/analyze",
        files={"file": ("contract.txt", empty_content, "text/plain")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_upload_valid_document_pipeline(monkeypatch):
    import backend.app.routes.analyze as analyze_module
    # Use mock AI service to test end-to-end route without external API calls during unit tests
    monkeypatch.setattr(analyze_module, "ai_service", MockAIService())

    valid_text = (
        "This Commercial Lease Agreement is made between Metro Properties (Landlord) "
        "and LexPilot Inc (Tenant). Rent is $4,500 monthly. Tenant must maintain insurance. "
        "Notice of non-renewal must be served at least 90 days prior."
    )
    response = client.post(
        "/api/analyze",
        files={"file": ("lease.txt", valid_text.encode("utf-8"), "text/plain")}
    )
    assert response.status_code == 200
    result = response.json()
    assert result["document_type"] == "Commercial Lease Agreement"
    assert len(result["parties"]) == 2
    assert result["termination"]["notice_period"] == "15 days cure period"
    assert len(result["attention_items"]) == 1
    assert "Automatic Renewal" in result["attention_items"][0]["title"]
