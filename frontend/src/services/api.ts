import axios from "axios";

import type {
    LoanApplication,
    PredictionResponse,
    ValidationResponse,
} from "../types/loan";

import type {
    ChatRequest,
    ChatResponse,
    SuggestionsResponse,
} from "../types/assistant";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 8000,
});

export const predictLoan = async (
    application: LoanApplication
): Promise<PredictionResponse> => {
    const response = await api.post<PredictionResponse>(
        "/predict",
        application
    );

    return response.data;
};

export const validateLoan = async (
    application: LoanApplication
): Promise<ValidationResponse> => {
    const response = await api.post<ValidationResponse>(
        "/validate",
        application
    );

    return response.data;
};

export const checkHealth = async () => {
    const response = await api.get("/health");

    return response.data;
};

export const checkModelStatus = async () => {
    const response = await api.get("/model-status");

    return response.data;
};

// Client-side instant knowledge base in case backend is offline
function getClientSideKnowledgeReply(message: string, context?: ChatRequest["context"]): ChatResponse {
    const msg = message.toLowerCase();

    if (msg.includes("cibil") || msg.includes("credit score") || msg.includes("improve") || msg.includes("score")) {
        return {
            reply: `### 📈 How to Improve & Strengthen Your CIBIL Credit Score\n\nYour Credit Score (ranging from **300 to 900**) is the key factor banks evaluate before sanctioning a loan. A score of **750+** secures the lowest interest rates and fastest approvals.\n\n#### 5 Proven Steps to Boost Your Score:\n1. **Always Pay On Time (35% impact)**: Never miss an EMI or credit card due date. Set up auto-debit to avoid accidental delays.\n2. **Keep Credit Utilization Under 30%**: If your total card limit is ₹1,00,000, keep your monthly spending under ₹30,000.\n3. **Avoid Multiple Loan Applications**: Applying to several banks at once triggers multiple "hard inquiries", which hurts your score.\n4. **Maintain a Balanced Credit Mix**: Having both secured loans (home/car) and unsecured lines (credit card) shows disciplined credit behavior.\n5. **Check for Errors on Your Report**: Download your CIBIL report once a year and dispute any incorrect late payment flags or closed accounts.`,
            suggestions: [
                "What is Debt-to-Income (DTI) ratio?",
                "What documents are required for quick approval?",
                "Does checking my credit score lower it?"
            ],
            model: "loanwise-smart-assistant",
            status: "success"
        };
    }

    if (msg.includes("reject") || msg.includes("declined") || msg.includes("reasons") || msg.includes("why")) {
        return {
            reply: `### ⚠️ Top Reasons for Loan Rejection and How to Fix Them\n\nLenders evaluate credit risk through automated underwriting. The most frequent rejection triggers are:\n\n1. **Low Credit Score (< 650)**: Indicates higher historical risk of default.\n2. **High Debt-to-Income (DTI) Ratio (> 50%)**: If over half your monthly income is already committed to existing EMIs, lenders fear repayment stress.\n3. **Unstable Employment History**: Less than 1-2 years continuous employment or frequent job changes.\n4. **Income Documentation Mismatch**: Discrepancies between bank statement credits and submitted salary slips / ITR.\n5. **Excessive Loan Amount**: Asking for a loan exceeding 4-5x your annual income without collateral or co-borrower.\n\n**💡 Actionable Tip**: Adding an earning co-applicant (spouse/parent) or extending the loan tenure to lower the monthly EMI will dramatically improve approval odds!`,
            suggestions: [
                "How do banks calculate maximum loan eligibility?",
                "How to boost CIBIL score to 750+?",
                "Should I choose a longer tenure or higher EMI?"
            ],
            model: "loanwise-smart-assistant",
            status: "success"
        };
    }

    if (msg.includes("eligibility") || msg.includes("calculate") || msg.includes("how much") || msg.includes("dti")) {
        return {
            reply: `### 📊 How Banks Calculate Your Loan Eligibility\n\nLenders primarily use the **FOIR (Fixed Obligation to Income Ratio)** and **DTI (Debt-to-Income Ratio)** to determine maximum loan sanction:\n\n#### Standard Formula Used by Lenders:\n- **Max Allowable Monthly EMI** = \`(Monthly Net Income × 50%) - Existing Monthly EMIs\`\n- **Max Loan Amount** = Calculated based on Max EMI, prevailing interest rate, and chosen tenure.\n\n#### Key Eligibility Factors:\n- **CIBIL Score (750+)**: High score = lowest interest rate and maximum loan amount.\n- **DTI Ratio**: Keep your total existing debt payments below **40%** of net monthly earnings.\n- **Employment Stability**: Salaried professionals with 2+ years experience or established businesses get preferential terms.`,
            suggestions: [
                "What documents are needed for salaried vs self-employed?",
                "How to boost CIBIL score to 750+?",
                "Why do loans get rejected?"
            ],
            model: "loanwise-smart-assistant",
            status: "success"
        };
    }

    if (msg.includes("document") || msg.includes("paper") || msg.includes("kyc") || msg.includes("apply")) {
        return {
            reply: `### 📑 Essential Documents Required for Loan Applications\n\nHaving your documentation organized in advance ensures quick verification:\n\n#### 1. Identity & Address Proof (KYC):\n- PAN Card (mandatory for credit verification)\n- Aadhaar Card / Passport / Voter ID\n\n#### 2. Income Proof (Salaried Applicants):\n- Last 3 to 6 months salary slips\n- Last 6 months bank statement showing salary credits\n- Form 16 / ITR of the last 2 assessment years\n\n#### 3. Income Proof (Self-Employed / Business):\n- Last 2-3 years audited Balance Sheet & Profit/Loss account\n- Last 2-3 years ITR with computation of income\n- Last 12 months current bank account statement\n- Business registration/GST certificate`,
            suggestions: [
                "How to boost CIBIL score to 750+?",
                "How do banks calculate maximum loan eligibility?",
                "Longer tenure vs higher EMI?"
            ],
            model: "loanwise-smart-assistant",
            status: "success"
        };
    }

    if (msg.includes("tenure") || msg.includes("emi") || msg.includes("interest") || msg.includes("prepayment")) {
        return {
            reply: `### ⚖️ Shorter Tenure vs. Longer Tenure: Which is Better?\n\n- **Shorter Tenure (e.g., 2 to 5 years)**:\n  - ✅ **Pro**: Significantly lower total interest paid over the life of the loan.\n  - ⚠️ **Con**: Higher monthly EMI, requiring higher disposable income.\n- **Longer Tenure (e.g., 10 to 20+ years)**:\n  - ✅ **Pro**: Lower monthly EMI, easier to fit within DTI limits and higher approval odds.\n  - ⚠️ **Con**: Substantially higher cumulative interest paid.\n\n**💡 Smart Strategy:** Choose a comfortable tenure that keeps your monthly EMI under 30% of your take-home pay, but make **annual partial prepayments** (using bonuses or savings) to drastically reduce interest costs without penalty.`,
            suggestions: [
                "How do banks calculate maximum loan eligibility?",
                "What documents are needed for quick approval?",
                "How to boost CIBIL score to 750+?"
            ],
            model: "loanwise-smart-assistant",
            status: "success"
        };
    }

    if (context) {
        const score = context.credit_score || 700;
        const income = context.annual_income || 500000;
        const loan = context.loan_amount || 1000000;
        const tenure = context.loan_tenure || 5;

        return {
            reply: `### 📋 Profile-Based Financial Guidance\n\nBased on your financial assessment:\n- **Credit Score**: ${score} (${score >= 750 ? "Excellent" : score >= 700 ? "Good" : "Fair"})\n- **Annual Income**: ₹${income.toLocaleString()}\n- **Requested Loan**: ₹${loan.toLocaleString()}\n- **Tenure**: ${tenure} years\n\n**Analysis**: With an income of ₹${income.toLocaleString()}, keeping your monthly repayment installments under ₹${Math.round((income / 12) * 0.4).toLocaleString()} will maximize your loan approval probability.`,
            suggestions: [
                "How can I improve my CIBIL score to 750+?",
                "What documents are needed for quick approval?",
                "Why do loans get rejected?"
            ],
            model: "loanwise-smart-assistant",
            status: "success"
        };
    }

    return {
        reply: `### 💡 Loan & Financial Advisory\n\nThank you for asking about **"${message.trim()}"**.\n\nHere are core financial principles to remember:\n- **CIBIL Score (750+)**: Key benchmark for getting the best interest rate and rapid sanction.\n- **Debt-to-Income (DTI)**: Keep total monthly debt payments under **40%** of net income.\n- **Employment Stability**: At least 1-2 years of stable salaried or self-employed track record.\n- **Prepayment Strategy**: Prepaying even 5-10% of principal early in the loan tenure reduces your interest burden significantly.\n\nFeel free to ask any specific follow-up question or click any of the suggested topics!`,
        suggestions: [
            "How to boost CIBIL score to 750+?",
            "Why do loans get rejected?",
            "What documents are required for quick approval?"
        ],
        model: "loanwise-smart-assistant",
        status: "success"
    };
}

export const sendAssistantMessage = async (
    request: ChatRequest
): Promise<ChatResponse> => {
    try {
        const response = await api.post<ChatResponse>(
            "/assistant/chat",
            request
        );
        return response.data;
    } catch {
        // Resilient automatic fallback if backend server is not running
        return getClientSideKnowledgeReply(request.message, request.context);
    }
};

export const fetchAssistantSuggestions = async (): Promise<SuggestionsResponse> => {
    try {
        const response = await api.get<SuggestionsResponse>(
            "/assistant/suggestions"
        );
        return response.data;
    } catch {
        return {
            categories: ["Loan Approval", "Credit Score", "EMI & Planning"],
            suggestions: []
        };
    }
};

export default api;