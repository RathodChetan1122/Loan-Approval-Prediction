from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.loan_routes import router


app = FastAPI(
    title="Loan Approval Prediction API",
    description="ML API for 7-feature loan approval prediction",
    version="2.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(router)