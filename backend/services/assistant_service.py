import os
import json
from typing import Any, List, Optional
import urllib.request
import urllib.error

SYSTEM_INSTRUCTION = """You are "LoanWise AI", an expert Loan & Financial Assistant specializing in:
1. Loan Approval Prediction & Eligibility factors (Annual Income, CIBIL/Credit Score, DTI ratio, Employment stability, Dependents, Loan Tenure).
2. Credit Score (CIBIL/Experian) Guidance: Score ranges (300-900), improving credit score from poor (<600) to fair (600-699) and good/excellent (700-900), dispute resolution, credit utilization ratio (<30%), impact of multiple hard inquiries, and credit mix.
3. Loan Types & Terms: Personal loans, Home loans, Education loans, Vehicle loans, Business loans, Fixed vs Floating interest rates.
4. EMI Planning & Debt Management: EMI calculation formula, balancing tenure vs total interest paid, prepayment strategies, foreclosure, and Debt-to-Income (DTI) optimization.
5. Documentation & Verification: KYC (Aadhaar, PAN), income proof (ITR, Form 16, Salary Slips, Bank Statements), property documents, and guarantor requirements.

Tone and Style:
- Clear, professional, encouraging, and highly structured with bullet points, bold key terms, and concise actionable steps.
- Provide direct answers with practical financial advice.
- When relevant, offer tips on how to improve approval chances with Indian and global banking standards.
- Always include a polite reminder that approval decisions ultimately rest with individual lending institutions and credit underwriting policies.
"""

FALLBACK_KNOWLEDGE = [
    {
        "keywords": ["cibil", "credit score", "improve score", "increase score", "raise score", "low score"],
        "reply": (
            "### 📈 How to Improve & Strengthen Your CIBIL Credit Score\n\n"
            "Your CIBIL/Credit Score (ranging between **300 and 900**) is one of the most critical factors in loan approval. "
            "A score of **750+** is generally considered ideal by most banks and NBFCs.\n\n"
            "#### Key Strategies to Boost Your Score:\n"
            "1. **Timely Repayments (35% impact)**: Always pay EMIs and credit card bills before the due date. Even a single 30-day default can lower your score by 50+ points.\n"
            "2. **Maintain Low Credit Utilization (< 30%)**: Keep your total credit card spends under 30% of your available limit.\n"
            "3. **Avoid Multiple Loan Inquiries**: Submitting multiple loan applications within a short window triggers 'Hard Inquiries', signaling credit hunger.\n"
            "4. **Maintain a Healthy Credit Mix**: Balance secured loans (home, auto) and unsecured loans (personal, credit cards).\n"
            "5. **Check for Errors on CIBIL Report**: Periodically download your official report and dispute any misreported defaults or active accounts you already closed."
        ),
        "suggestions": [
            "What is the ideal Debt-to-Income (DTI) ratio for loans?",
            "What documents are required for quick loan approval?",
            "Does checking my own CIBIL score reduce it?",
        ]
    },
    {
        "keywords": ["rejection", "rejected", "why reject", "declined", "reasons"],
        "reply": (
            "### ⚠️ Top Reasons for Loan Rejection and How to Fix Them\n\n"
            "Banks use automated underwriting algorithms to evaluate credit risk. The most common rejection triggers include:\n\n"
            "1. **Low Credit Score (< 650)**: High past default risk or insufficient credit history.\n"
            "2. **High Debt-to-Income (DTI) Ratio (> 50%)**: If more than 50% of your monthly income is already committed to existing EMIs, lenders fear repayment stress.\n"
            "3. **Unstable Employment History**: Job hopping or less than 1-2 years continuous experience in current employment/business.\n"
            "4. **Inconsistent Documentation**: Mismatches in salary slips, PAN/Aadhaar details, or unverified income.\n"
            "5. **High Loan Amount vs. Income**: Requesting an amount exceeding 4-5x your annual gross income without collateral or co-borrower.\n\n"
            "**💡 Actionable Next Steps:** Consider adding a co-applicant with a solid credit profile, opting for a longer tenure to reduce EMI, or reducing the requested loan amount."
        ),
        "suggestions": [
            "How can I improve my CIBIL score quickly?",
            "Should I choose a longer tenure or higher EMI?",
            "How does employment type affect interest rates?",
        ]
    },
    {
        "keywords": ["eligibility", "calculate eligibility", "qualify", "how much loan", "how do banks calculate"],
        "reply": (
            "### 📊 How Banks Calculate Your Loan Eligibility\n\n"
            "Lenders primarily use the **FOIR (Fixed Obligation to Income Ratio)** and **DTI (Debt-to-Income Ratio)** to determine maximum loan sanction:\n\n"
            "#### Standard Formula Used by Lenders:\n"
            "- **Max Allowable EMI** = `(Monthly Net Income × 50%) - Existing Monthly EMIs`\n"
            "- **Max Loan Amount** = Calculated based on Max EMI, prevailing interest rate, and preferred tenure.\n\n"
            "#### Key Eligibility Pillars:\n"
            "| Parameter | Ideal Benchmark | Impact |\n"
            "| :--- | :--- | :--- |\n"
            "| **CIBIL Score** | 750 or above | High - Lowest interest rate |\n"
            "| **FOIR / DTI** | Under 40% - 50% | Critical - Determines loan size |\n"
            "| **Employment** | Govt / Reputed MNC / 2+ yrs stable | Moderate - Better terms |\n"
            "| **Dependents** | Lower dependent ratio | Improves disposable income |"
        ),
        "suggestions": [
            "What are the best ways to reduce my existing EMI burden?",
            "What documents are needed for salaried vs self-employed?",
            "How to check loan approval probability on this platform?",
        ]
    },
    {
        "keywords": ["documents", "documentation", "papers", "kyc", "what do i need to apply"],
        "reply": (
            "### 📑 Essential Documents Required for Loan Applications\n\n"
            "Having your documentation organized in advance ensures swift verification and prevents processing delays:\n\n"
            "#### 1. Identity & Address Proof (KYC):\n"
            "- PAN Card (mandatory for credit check & tax compliance)\n"
            "- Aadhaar Card / Passport / Voter ID / Driving License\n\n"
            "#### 2. Income Proof (Salaried Applicants):\n"
            "- Last 3 to 6 months salary slips\n"
            "- Last 6 months bank statement showing salary credits\n"
            "- Form 16 / ITR of the last 2 assessment years\n\n"
            "#### 3. Income Proof (Self-Employed / Business):\n"
            "- Last 2-3 years audited Balance Sheet & Profit/Loss account\n"
            "- Last 2-3 years ITR with computation of income\n"
            "- Last 12 months current bank account statement\n"
            "- Business registration/GST certificate\n\n"
            "#### 4. Property Documents (for Home/Mortgage Loans):\n"
            "- Sale deed, Title chain documents, Approved floor plan, NOC from builder/society."
        ),
        "suggestions": [
            "What is a good CIBIL score for personal vs home loans?",
            "How do banks evaluate self-employed loan applicants?",
            "How does loan tenure impact total interest paid?",
        ]
    },
    {
        "keywords": ["emi", "tenure", "interest", "calculate", "longer tenure", "shorter tenure"],
        "reply": (
            "### ⚖️ Choosing Between Longer Tenure vs. Shorter Tenure\n\n"
            "Balancing your loan tenure against your monthly cash flow is essential for optimal financial health:\n\n"
            "#### Comparison:\n"
            "- **Shorter Tenure (e.g., 2 to 5 years)**:\n"
            "  - ✅ **Pro**: Significantly lower total interest paid over the life of the loan.\n"
            "  - ⚠️ **Con**: Higher monthly EMI, requiring higher disposable income.\n"
            "- **Longer Tenure (e.g., 10 to 20+ years)**:\n"
            "  - ✅ **Pro**: Lower monthly EMI, easier to fit within DTI limits and higher approval odds.\n"
            "  - ⚠️ **Con**: Substantially higher cumulative interest paid.\n\n"
            "**💡 Smart Borrowing Tip:** Opt for a comfortable tenure that keeps your EMI under 30% of your take-home pay, but make **annual partial prepayments** (e.g., using bonuses) to drastically reduce interest costs."
        ),
        "suggestions": [
            "How do I use the built-in EMI Calculator on this site?",
            "How can I improve my loan approval chances with low income?",
            "What is the difference between fixed and floating interest rates?",
        ]
    }
]

DEFAULT_SUGGESTIONS = [
    {
        "title": "Loan Eligibility Calculation",
        "prompt": "How do banks calculate my maximum loan eligibility and allowable EMI?",
        "category": "Loan Approval Queries",
        "icon": "calculator"
    },
    {
        "title": "Common Rejection Causes",
        "prompt": "What are the most common reasons for loan rejection and how can I avoid them?",
        "category": "Loan Approval Queries",
        "icon": "shield-alert"
    },
    {
        "title": "Debt-to-Income (DTI) Impact",
        "prompt": "What is Debt-to-Income (DTI) ratio and how does it affect my loan approval odds?",
        "category": "Loan Approval Queries",
        "icon": "percent"
    },
    {
        "title": "Required Loan Documents",
        "prompt": "What documents are required for quick salaried and self-employed loan approval?",
        "category": "Loan Approval Queries",
        "icon": "file-text"
    },
    {
        "title": "Boost CIBIL Score to 750+",
        "prompt": "How can I improve my CIBIL score from 650 to 750+ step-by-step?",
        "category": "Credit Score Queries",
        "icon": "trending-up"
    },
    {
        "title": "Credit Score Check Myth",
        "prompt": "Does checking my own CIBIL score frequently reduce my credit rating?",
        "category": "Credit Score Queries",
        "icon": "help-circle"
    },
    {
        "title": "Ideal Score for Loans",
        "prompt": "What is the minimum credit score required for personal loans vs home loans in India?",
        "category": "Credit Score Queries",
        "icon": "award"
    },
    {
        "title": "Recover from Late Payments",
        "prompt": "How do late EMI or credit card payments affect my credit report and how long does recovery take?",
        "category": "Credit Score Queries",
        "icon": "clock"
    },
    {
        "title": "Tenure vs EMI Optimization",
        "prompt": "Should I choose a longer repayment tenure with smaller EMI or a shorter tenure with higher EMI?",
        "category": "EMI & Planning",
        "icon": "sliders"
    },
    {
        "title": "Employment Type Influence",
        "prompt": "How does employment type (Government, Private, Self-Employed) influence loan approval and interest rates?",
        "category": "EMI & Planning",
        "icon": "briefcase"
    }
]


def _call_gemini_api(
    message: str,
    history: List[dict],
    context: Optional[dict] = None
) -> Optional[str]:
    """
    Attempt to call Google Gemini API using configured API keys.
    Supports GEMINI_API_KEY or GOOGLE_API_KEY environment variables.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return None

    # Construct conversation contents for Gemini REST API
    # Gemini 2.5 Flash / Gemini 2.0 Flash / Gemini 1.5 Flash
    models_to_try = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]

    # Build system prompt with context if present
    full_system = SYSTEM_INSTRUCTION
    if context:
        full_system += f"\n\nApplicant Context:\n{json.dumps(context, indent=2)}"

    contents = []
    # Add history
    for item in history[-6:]:  # Keep recent turns
        role = "user" if item.get("role") == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": item.get("content", "")}]
        })

    # Add current user message
    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })

    payload = {
        "systemInstruction": {
            "parts": [{"text": full_system}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "topP": 0.9,
            "maxOutputTokens": 1024,
        }
    }

    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status == 200:
                    resp_data = json.loads(response.read().decode("utf-8"))
                    candidates = resp_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
        except Exception:
            continue

    return None


def _get_fallback_reply(message: str, context: Optional[dict] = None) -> tuple[str, List[str]]:
    """
    Generate an intelligent expert financial response when Gemini API is offline or without key.
    """
    msg_lower = message.lower()

    for item in FALLBACK_KNOWLEDGE:
        if any(kw in msg_lower for kw in item["keywords"]):
            return item["reply"], item["suggestions"]

    # If applicant context is provided, generate personalized guidance
    if context:
        c_score = context.get("credit_score", 700)
        income = context.get("annual_income", 500000)
        loan = context.get("loan_amount", 1000000)
        tenure = context.get("loan_tenure", 5)
        emp = context.get("employment_type", "Private")

        dti_ratio = round((loan / max(income, 1)), 2)
        reply = (
            f"### 📋 Profile-Based Loan Analysis\n\n"
            f"Based on your profile details:\n"
            f"- **Credit Score**: {c_score} ({'Good' if c_score >= 700 else 'Fair / Needs Improvement'})\n"
            f"- **Annual Income**: ₹{income:,}\n"
            f"- **Requested Loan**: ₹{loan:,} (Loan-to-Income Multiple: {dti_ratio}x)\n"
            f"- **Tenure**: {tenure} years | **Employment**: {emp}\n\n"
            f"#### Key Observations:\n"
            f"1. **Approval Likelihood**: {'Favorable due to sound credit profile' if c_score >= 700 and dti_ratio <= 4 else 'May require stronger co-applicant or adjusted tenure'}.\n"
            f"2. **Recommendation**: Keep existing debt commitments low and verify all income documents."
        )
        suggestions = [
            "How can I improve my CIBIL score?",
            "What are the required documents for my profile?",
            "How does EMI calculation work for this loan?"
        ]
        return reply, suggestions

    # Generic comprehensive response
    reply = (
        "### 💡 LoanWise AI Assistant\n\n"
        f"Thank you for your question regarding **'{message.strip()}'**.\n\n"
        "Here are key financial fundamentals to consider:\n"
        "- **Credit Score (CIBIL 750+)**: Serves as the primary filter for interest rate discounts and quick sanction.\n"
        "- **Fixed Obligation to Income (FOIR)**: Ensure total monthly EMIs stay below **40%-50%** of your net monthly earnings.\n"
        "- **Employment & Income Stability**: At least 1-2 years continuous service with verifiable tax returns (ITR/Form 16) reinforces repayment capacity.\n"
        "- **Tenure Selection**: Use our independent EMI Calculator to find the right equilibrium between affordable monthly installments and total interest cost.\n\n"
        "Feel free to click any of the suggested topics below or ask a specific question about your financial scenario!"
    )
    suggestions = [
        "How do banks calculate loan eligibility?",
        "How can I improve my CIBIL score to 750+?",
        "What causes instant loan rejection?",
    ]
    return reply, suggestions


def process_chat_message(
    message: str,
    history: Optional[List[Any]] = None,
    context: Optional[dict] = None
) -> dict:
    """
    Main entry point for handling AI Loan Assistant chat queries.
    Tries Google Gemini first, falls back gracefully to expert financial engine.
    """
    history_list = []
    if history:
        for item in history:
            if hasattr(item, "model_dump"):
                history_list.append(item.model_dump())
            elif isinstance(item, dict):
                history_list.append(item)

    gemini_reply = _call_gemini_api(message, history_list, context)

    if gemini_reply:
        # Generate dynamic follow-up suggestions
        suggestions = [
            "What documents are required for quick approval?",
            "How does my CIBIL score affect interest rates?",
            "How can I lower my monthly EMI burden?"
        ]
        return {
            "reply": gemini_reply,
            "suggestions": suggestions,
            "model": "google-gemini-2.5-flash",
            "status": "success",
        }

    # Use specialized fallback engine
    reply, suggestions = _get_fallback_reply(message, context)
    return {
        "reply": reply,
        "suggestions": suggestions,
        "model": "loanwise-financial-expert",
        "status": "success",
    }


def get_curated_suggestions() -> dict:
    """
    Returns curated list of suggested prompt topics and categories.
    """
    categories = [
        "Loan Approval Queries",
        "Credit Score Queries",
        "EMI & Planning",
    ]
    return {
        "categories": categories,
        "suggestions": DEFAULT_SUGGESTIONS,
    }
