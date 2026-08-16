from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from routes.loan_routes import router
from routes.ntc_routes import router as ntc_router
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

    # Allow local development ports and Vercel preview deployments
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app",

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

# Existing loan prediction + maximum eligible loan endpoints
app.include_router(router)

# Existing New-to-Credit functionality
app.include_router(ntc_router)

# New AI Loan Assistant
app.include_router(assistant_router)
