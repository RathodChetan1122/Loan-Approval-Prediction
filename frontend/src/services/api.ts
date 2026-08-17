import axios from "axios";

import type {
    LoanApplication,
    MaxLoanEstimateResponse,
    PredictionResponse,
    ValidationResponse,
    NTCApplication,
    NTCPredictionResponse,
} from "../types/loan";

import type {
    ChatRequest,
    ChatResponse,
    SuggestionsResponse,
} from "../types/assistant";

const PRIMARY_API_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const FALLBACK_API_URL = PRIMARY_API_URL.includes("8000")
    ? "http://localhost:8001"
    : "http://localhost:8000";

const api = axios.create({
    baseURL: PRIMARY_API_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 8000,
});

export const predictLoan = async (
    application: LoanApplication
): Promise<PredictionResponse> => {
    try {
        const response = await api.post<PredictionResponse>(
            "/predict",
            application
        );
        return response.data;
    } catch (err) {
        try {
            const fallbackResponse = await axios.post<PredictionResponse>(
                `${FALLBACK_API_URL}/predict`,
                application,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    timeout: 4000,
                }
            );
            return fallbackResponse.data;
        } catch (fallbackErr) {
            throw new Error("Prediction service is temporarily unavailable. Please try again.");
        }
    }
};

export const predictNTC = async (
    application: NTCApplication
): Promise<NTCPredictionResponse> => {
    console.log("[NTC] /new-predict requested loan amount:", application.loan_amount);
    try {
        const response = await api.post<NTCPredictionResponse>(
            "/new-predict",
            application
        );
        console.log("[NTC] /new-predict response:", response.data);
        console.log("[NTC] Backend prediction succeeded: TRUE");
        console.log("[NTC] Using client fallback: FALSE");
        console.log("[NTC] Final result sent to UI:", response.data);
        return response.data;
    } catch (err) {
        try {
            const fallbackResponse = await axios.post<NTCPredictionResponse>(
                `${FALLBACK_API_URL}/new-predict`,
                application,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    timeout: 4000,
                }
            );
            console.log("[NTC] /new-predict fallback response:", fallbackResponse.data);
            console.log("[NTC] Backend prediction succeeded: TRUE (via fallback port)");
            console.log("[NTC] Using client fallback: FALSE");
            console.log("[NTC] Final result sent to UI:", fallbackResponse.data);
            return fallbackResponse.data;
        } catch (fallbackErr) {
            console.error("[NTC] /new-predict both primary and fallback failed.");
            throw new Error("Prediction service is temporarily unavailable. Please try again.");
        }
    }
};

export const getMaxEligibleLoan = async (
    application: LoanApplication
): Promise<MaxLoanEstimateResponse> => {
    try {
        const response = await api.post<MaxLoanEstimateResponse>(
            "/max-eligible-loan",
            application
        );
        return response.data;
    } catch {
        throw new Error("Prediction service is temporarily unavailable. Please try again.");
    }
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

/**
 * Send a message to the AI Loan Assistant.
 *
 * The backend provides the primary response. If the backend is
 * unavailable, the client-side knowledge engine below provides
 * a resilient fallback response.
 */
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
        return getClientSideKnowledgeReply(
            request.message,
            request.context
        );
    }
};

export const fetchAssistantSuggestions =
    async (): Promise<SuggestionsResponse> => {
        try {
            const response = await api.get<SuggestionsResponse>(
                "/assistant/suggestions"
            );

            return response.data;
        } catch {
            return {
                categories: [
                    "Loan Approval",
                    "Credit Score",
                    "EMI & Planning",
                ],
                suggestions: [],
            };
        }
    };

/**
 * Client-side financial knowledge fallback.
 *
 * Keep this lightweight and deterministic. The backend AI assistant
 * remains the primary source when available.
 */
const FINANCIAL_KNOWLEDGE_ENTRIES: Array<{
    patterns: RegExp[];
    reply: string;
    suggestions: string[];
}> = [
    {
        patterns: [/\bmoney\b/i, /\bcurrency\b/i, /\bfiat\b/i],
        reply: `### 💵 What is Money and How Does It Work?

**Money** is an officially recognized medium of exchange that enables individuals and institutions to trade goods, purchase services, and store economic value over time.

#### The 4 Fundamental Functions of Money:
1. **Medium of Exchange**: Allows people to buy and sell goods and services.
2. **Unit of Account**: Provides a common way to measure and compare economic value.
3. **Store of Value**: Allows purchasing power to be saved for future use.
4. **Standard of Deferred Payment**: Supports borrowing, lending, and credit agreements.

You can ask me about loans, credit scores, interest rates, EMI, eligibility, or financial planning.`,
        suggestions: [
            "What is a loan and how does it work?",
            "What is inflation?",
            "What is the difference between simple and compound interest?",
        ],
    },

    {
        patterns: [
            /\bloans?\b/i,
            /\bborrow(ing)?\b/i,
            /\blending\b/i,
            /\bdebt\b/i,
        ],
        reply: `### 🏦 What is a Loan and How Does It Work?

A **loan** is a financial agreement where a lender provides money to a borrower, who repays the principal over an agreed tenure together with interest.

#### Core Components:
1. **Principal** — amount borrowed.
2. **Interest Rate** — cost of borrowing.
3. **Tenure** — repayment period.
4. **EMI** — recurring repayment amount.
5. **Collateral** — security used for certain secured loans.

Loans may be secured or unsecured, and approval depends on factors such as credit profile, income, existing obligations, and the requested amount.`,
        suggestions: [
            "How do banks calculate maximum loan eligibility?",
            "What is the difference between fixed and floating interest rates?",
            "What documents are required for loan approval?",
        ],
    },

    {
        patterns: [
            /\binterest\b/i,
            /\bapr\b/i,
            /\bcompound\b/i,
            /\brepo\s*rate\b/i,
        ],
        reply: `### 📈 Understanding Interest Rates

**Interest** is the cost of borrowing money.

#### Simple vs Compound Interest
- **Simple Interest** is calculated on the original principal.
- **Compound Interest** includes previously accumulated interest.

#### Fixed vs Floating
- **Fixed Rate** remains unchanged for the agreed period.
- **Floating Rate** can change according to the applicable benchmark.

#### APR
**APR** represents the broader annual cost of borrowing and can include applicable fees in addition to the nominal interest rate.`,
        suggestions: [
            "Should I choose fixed or floating interest?",
            "How does credit score impact interest rates?",
            "How can I reduce total interest?",
        ],
    },

    {
        patterns: [
            /\bfixed\s*(vs|or)\s*floating\b/i,
            /\bfloating\s*(vs|or)\s*fixed\b/i,
            /\bfixed\s*rate\b/i,
            /\bfloating\s*rate\b/i,
        ],
        reply: `### ⚖️ Fixed Rate vs Floating Rate

| Feature | Fixed | Floating |
|---|---|---|
| EMI predictability | High | Can change |
| Rate changes | Generally stable | Can change with benchmark |
| Budget planning | Easier | Requires flexibility |
| Potential benefit | Predictable payments | Can benefit when rates fall |

The better option depends on the loan type, tenure, current rates, and your tolerance for changing EMIs.`,
        suggestions: [
            "How do prepayments reduce loan tenure?",
            "How does the RBI repo rate affect loans?",
            "What is a good CIBIL score?",
        ],
    },

    {
        patterns: [
            /\bpersonal\s*loans?\b/i,
            /\bunsecured\s*loans?\b/i,
        ],
        reply: `### 💳 Personal Loans

A **Personal Loan** is generally an unsecured loan that can be used for multiple purposes without pledging an asset as collateral.

Approval commonly considers:
- Credit score
- Income
- Employment stability
- Existing obligations
- Requested loan amount
- Repayment capacity

Because personal loans are usually unsecured, lenders may price them differently from secured loans.`,
        suggestions: [
            "Why do personal loans get rejected?",
            "How is personal loan EMI calculated?",
            "How does CIBIL affect personal loans?",
        ],
    },

    {
        patterns: [
            /\bhome\s*loans?\b/i,
            /\bhousing\s*loans?\b/i,
            /\bmortgage\b/i,
        ],
        reply: `### 🏡 Home Loans

A **Home Loan** is a secured loan used for purposes such as purchasing or constructing residential property.

Important concepts include:
- Loan-to-Value ratio
- Down payment
- Interest rate
- Tenure
- Property documentation
- Repayment capacity

The property generally acts as security for the loan.`,
        suggestions: [
            "How is home loan eligibility calculated?",
            "What is LTV?",
            "How does prepayment reduce interest?",
        ],
    },

    {
        patterns: [
            /\bcredit\s*cards?\b/i,
            /\bdebit\s*cards?\b/i,
        ],
        reply: `### 💳 Credit Card vs Debit Card

A **debit card** generally uses money already available in your bank account.

A **credit card** provides access to a revolving credit facility that must be repaid according to the card's billing terms.

Paying credit-card balances on time can help maintain a healthy credit history, while carrying expensive revolving balances can increase borrowing costs.`,
        suggestions: [
            "How does credit-card utilization affect CIBIL?",
            "Does checking my credit score reduce it?",
            "How can I improve my CIBIL score?",
        ],
    },

    {
        patterns: [
            /\bcibil\b/i,
            /\bcredit\s*score\b/i,
            /\bexperian\b/i,
            /\bequifax\b/i,
        ],
        reply: `### 📈 Credit Score Guidance

Credit scores are one factor lenders can consider when assessing credit risk.

Good habits include:
1. Paying EMIs and card bills on time.
2. Keeping credit utilization under control.
3. Avoiding unnecessary credit applications.
4. Maintaining a healthy credit mix.
5. Reviewing your credit report for errors.

A stronger credit profile can improve access to credit and potentially improve borrowing terms.`,
        suggestions: [
            "Does checking my own credit score lower it?",
            "What is Debt-to-Income ratio?",
            "What are common reasons for loan rejection?",
        ],
    },

    {
        patterns: [
            /\breject(ed|ion)?\b/i,
            /\bdeclined\b/i,
            /\bdenied\b/i,
            /\bwhy.*(reject|decline)\b/i,
        ],
        reply: `### ⚠️ Common Reasons for Loan Rejection

Common factors can include:

1. Low credit score or weak credit history.
2. High existing debt obligations.
3. Unstable income or employment history.
4. Income/document verification issues.
5. Requesting an amount beyond demonstrated repayment capacity.

### 💡 What You Can Do

Consider reducing outstanding obligations, improving your credit profile, selecting a manageable loan amount, or increasing the repayment tenure where appropriate.`,
        suggestions: [
            "How do banks calculate maximum loan eligibility?",
            "How can I improve my CIBIL score?",
            "Should I choose a longer tenure?",
        ],
    },

    {
        patterns: [
            /\beligibility\b/i,
            /\bhow\s*much\s*loan\b/i,
            /\bcalculate\s*eligibility\b/i,
            /\bfoir\b/i,
            /\bdti\b/i,
        ],
        reply: `### 📊 Loan Eligibility

Lenders can estimate loan eligibility using factors such as:

- Net income
- Existing monthly obligations
- Interest rate
- Loan tenure
- Credit profile
- Requested amount

A common approach is to determine an affordable monthly repayment first and then calculate the corresponding principal based on the interest rate and tenure.`,
        suggestions: [
            "What documents are required for loan approval?",
            "How can I improve my CIBIL score?",
            "What is the difference between fixed and floating rates?",
        ],
    },

    {
        patterns: [
            /\bdocuments?\b/i,
            /\bkyc\b/i,
            /\bpapers?\b/i,
            /\bwhat.*(need|required).*apply\b/i,
        ],
        reply: `### 📑 Loan Document Checklist

Depending on the lender and loan type, commonly requested documents can include:

- PAN and identity/address proof
- Income proof
- Salary slips for salaried applicants
- Bank statements
- ITR and financial statements for eligible self-employed applicants
- Property documents for secured property loans

Always verify the exact checklist with the lender.`,
        suggestions: [
            "How do banks evaluate self-employed applicants?",
            "What is a good CIBIL score?",
            "How does tenure affect interest?",
        ],
    },

    {
        patterns: [
            /\bemi\b/i,
            /\btenure\b/i,
            /\bprepayment\b/i,
            /\bforeclosure\b/i,
        ],
        reply: `### ⚖️ EMI and Tenure

EMI combines principal repayment and interest.

The standard reducing-balance EMI formula is:

**EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)**

where:
- **P** = principal
- **r** = monthly interest rate
- **n** = number of monthly installments

A shorter tenure generally means higher EMIs but can reduce total interest. A longer tenure lowers the EMI but can increase total interest.`,
        suggestions: [
            "How does CIBIL affect interest rates?",
            "What is DTI?",
            "Why do loans get rejected?",
        ],
    },

    {
        patterns: [
            /\bhello\b/i,
            /\bhi\b/i,
            /\bhey\b/i,
            /\bhow\s*are\s*you\b/i,
            /\bgood\s*morning\b/i,
            /\bwho\s*are\s*you\b/i,
            /\bwhat\s*can\s*you\s*do\b/i,
            /\bhelp\b/i,
        ],
        reply: `### 👋 Hello! I'm your AI Loan & Financial Assistant

I can help explain:

- Loan approval and eligibility
- Credit scores and CIBIL
- Interest rates
- EMI and repayment planning
- Loan documentation
- Common rejection reasons
- General personal-finance concepts

Ask me a financial question and I'll help you understand it.`,
        suggestions: [
            "What is a loan and how does it work?",
            "How can I improve my CIBIL score?",
            "Why do loans get rejected?",
        ],
    },
    {
        patterns: [
            /\bfood\b/i,
            /\bsports\b/i,
            /\bcricket\b/i,
            /\bweather\b/i,
            /\bmovies?\b/i,
            /\brecipe\b/i,
            /\bjoke\b/i,
            /\begg\b/i,
            /\bpolitics\b/i,
            /\bgames?\b/i,
        ],
        reply: `### 🤖 I am a Financial Assistant

I specialize in personal finance, loans, interest rates, and credit scores. I am not equipped to discuss off-topic subjects like food, sports, or entertainment.

Can I help you with a loan or financial query instead?`,
        suggestions: [
            "What is a personal loan?",
            "How does EMI calculation work?",
            "How can I check my credit score?",
        ],
    },
];

function getClientSideKnowledgeReply(
    message: string,
    context?: ChatRequest["context"]
): ChatResponse {
    const cleanMsg = message.trim();

    for (const entry of FINANCIAL_KNOWLEDGE_ENTRIES) {
        if (entry.patterns.some((pattern) => pattern.test(cleanMsg))) {
            return {
                reply: entry.reply,
                suggestions: entry.suggestions,
                model: "loanwise-smart-assistant",
                status: "success",
            };
        }
    }

    if (
        context &&
        (
            context.credit_score ||
            context.annual_income ||
            context.loan_amount
        )
    ) {
        const score = context.credit_score || 700;
        const income = context.annual_income || 500000;
        const loan = context.loan_amount || 1000000;
        const tenure = context.loan_tenure || 5;

        const dtiMultiple = Number(
            (loan / Math.max(income, 1)).toFixed(2)
        );

        return {
            reply: `### 📋 Financial Profile Analysis

- **Credit Score**: ${score}
- **Annual Income**: ₹${income.toLocaleString()}
- **Requested Loan**: ₹${loan.toLocaleString()}
- **Loan-to-Income Multiple**: ${dtiMultiple}x
- **Tenure**: ${tenure} years

Based on the provided profile, consider keeping monthly repayment obligations within a manageable portion of your income and reviewing your existing debts before taking on additional borrowing.`,
            suggestions: [
                "How can I improve my CIBIL score?",
                "What documents are required?",
                "What causes loan rejection?",
            ],
            model: "loanwise-smart-assistant",
            status: "success",
        };
    }

    return {
        reply: `### 💡 Financial Guide

I can help with loan eligibility, credit scores, EMI calculations, interest rates, documentation, rejection reasons, and general financial concepts.

Ask a specific question and I'll provide a structured explanation.`,
        suggestions: [
            "What is a loan and how does it work?",
            "How can I improve my CIBIL score?",
            "What is the difference between fixed and floating rates?",
        ],
        model: "loanwise-smart-assistant",
        status: "success",
    };
};

export default api;
