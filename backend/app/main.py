import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load local environment if .env exists
load_dotenv()

from .routes.analyze import router as analyze_router
from .routes.compare import router as compare_router
from .routes.ask import router as ask_router

app = FastAPI(
    title="LexPilot API",
    description="Legal document analysis backend for LexPilot",
    version="1.0.0"
)

# CORS setup - allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler to prevent leaking internal stack traces or secrets to the client.
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing your request. Please try again."}
    )

@app.get("/api/health")
@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend operational readiness."""
    has_gemini = bool(os.environ.get("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "service": "LexPilot Backend",
        "gemini_configured": has_gemini
    }

# Register routers: support both /api prefix and root
app.include_router(analyze_router)
app.include_router(analyze_router, prefix="/api")
app.include_router(compare_router)
app.include_router(compare_router, prefix="/api")
app.include_router(ask_router)
app.include_router(ask_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
