from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.loan_routes import router


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Loan Approval Prediction API",
    description="ML API for 7-feature loan approval prediction",
    version="2.0.0",
)


# ============================================================
# CORS
# ============================================================

ALLOWED_ORIGINS = [
    # Local development ports
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # Production Vercel deployment
    "https://loan-approval-prediction-xi-self.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,

    # Allow any local port (5173, 5174, etc.) as well as all Vercel preview/production deployments
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app",

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(router)