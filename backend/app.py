from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from routes.loan_routes import router as loan_router
from routes.assistant_routes import router as assistant_router


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Loan Approval Prediction API",
    description="ML API for 7-feature loan approval prediction and AI Loan Assistant",
    version="2.1.0",
)


# ============================================================
# CORS
# ============================================================

ALLOWED_ORIGINS = [
    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # Production Vercel deployment
    "https://loan-approval-prediction-xi-self.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,

    # Allow Vercel preview deployments as well
    allow_origin_regex=r"https://.*\.vercel\.app",

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(loan_router)
app.include_router(assistant_router)