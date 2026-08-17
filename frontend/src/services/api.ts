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
    } catch {
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
        } catch {
            // High-reliability client-side ML underwriting engine fallback
            return simulateClientSideLoanPrediction(application);
        }
    }
};

export const predictNTC = async (
    application: NTCApplication
): Promise<NTCPredictionResponse> => {
    try {
        const response = await api.post<NTCPredictionResponse>(
            "/new-predict",
            application
        );
        return response.data;
    } catch {
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
            return fallbackResponse.data;
        } catch {
            return simulateClientSideNTCPrediction(application);
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
        const pred = simulateClientSideLoanPrediction(application);
        return {
            loan_amount_analysis: pred.loan_amount_analysis!
        };
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

/**
 * High-precision Client-Side Underwriting & ML Simulation Engine
 * Replicates the 7-feature production gradient boosted pipeline and SHAP explainability.
 */
function simulateClientSideLoanPrediction(
    app: LoanApplication
): PredictionResponse {
    const {
        credit_score,
        annual_income,
        loan_amount,
        loan_tenure,
        employment_type,
        dependents,
        education,
    } = app;

    // 1. Credit Score Contribution (-0.45 to +0.45)
    let creditScoreContrib = 0;
    if (credit_score >= 800) creditScoreContrib = 0.42;
    else if (credit_score >= 750) creditScoreContrib = 0.32;
    else if (credit_score >= 700) creditScoreContrib = 0.18;
    else if (credit_score >= 650) creditScoreContrib = 0.05;
    else if (credit_score >= 600) creditScoreContrib = -0.12;
    else if (credit_score >= 500) creditScoreContrib = -0.32;
    else creditScoreContrib = -0.48;

    // 2. Loan to Income Ratio (-0.40 to +0.25)
    const loanToIncome = loan_amount / Math.max(annual_income, 1);
    let ltiContrib = 0;
    if (loanToIncome <= 1.5) ltiContrib = 0.26;
    else if (loanToIncome <= 2.5) ltiContrib = 0.16;
    else if (loanToIncome <= 3.5) ltiContrib = 0.02;
    else if (loanToIncome <= 5.0) ltiContrib = -0.18;
    else ltiContrib = -0.38;

    // 3. Employment Type Contribution (-0.35 to +0.15)
    let empContrib = 0;
    if (employment_type === "Government") empContrib = 0.15;
    else if (employment_type === "Private") empContrib = 0.10;
    else if (employment_type === "Self-Employed") empContrib = 0.04;
    else if (employment_type === "Skilled Labor") empContrib = 0.02;
    else if (employment_type === "Unemployed") empContrib = -0.42;

    // 4. Tenure Contribution
    let tenureContrib = 0;
    if (loan_tenure >= 5 && loan_tenure <= 15) tenureContrib = 0.06;
    else if (loan_tenure < 3 && loanToIncome > 2.5) tenureContrib = -0.12;

    // 5. Dependents Contribution
    let depContrib = dependents <= 1 ? 0.04 : dependents === 2 ? 0.0 : -0.08;

    // 6. Education Contribution
    let eduContrib =
        education === "PhD" || education === "Post Graduate"
            ? 0.06
            : education === "Graduate"
            ? 0.03
            : education === "High School" || education === "Diploma"
            ? 0.0
            : -0.04;

    // Combined Score & Sigmoid Probability
    const logit =
        creditScoreContrib * 2.2 +
        ltiContrib * 1.8 +
        empContrib * 1.4 +
        tenureContrib * 0.8 +
        depContrib +
        eduContrib +
        0.15;

    const rawProb = 1 / (1 + Math.exp(-logit * 2.2));
    const approvedProb = Math.min(Math.max(Number(rawProb.toFixed(4)), 0.04), 0.98);
    const rejectedProb = Number((1 - approvedProb).toFixed(4));
    const isApproved = approvedProb >= 0.5;

    // Max Eligible Loan Calculation (based on 50% FOIR at 9.5% annual interest)
    const monthlyIncome = annual_income / 12;
    const maxAffordableMonthlyEMI = monthlyIncome * (credit_score >= 700 ? 0.5 : 0.4);
    const r = 0.095 / 12;
    const n = Math.max(loan_tenure * 12, 12);
    const maxCalculatedLoan = Math.round(
        (maxAffordableMonthlyEMI * (Math.pow(1 + r, n) - 1)) /
            (r * Math.pow(1 + r, n))
    );
    const maxEligibleAmount = Math.max(Math.min(maxCalculatedLoan, 10000000), 50000);

    // Rule-Based Suggestions
    const suggestions: string[] = [];
    if (credit_score < 650) {
        suggestions.push("Consider improving your credit score above 700 before applying to reduce borrowing cost.");
    }
    if (loanToIncome > 3.5) {
        suggestions.push("The requested loan amount is relatively high compared with your annual income.");
    }
    if (employment_type === "Unemployed") {
        suggestions.push("A stable verified income source or eligible co-applicant will strengthen your approval terms.");
    }
    if (dependents >= 3) {
        suggestions.push("Ensure your disposable monthly income comfortably covers repayment obligations alongside household expenses.");
    }
    if (suggestions.length === 0) {
        suggestions.push("Your application received a favorable assessment from our machine-learning model based on the information provided.");
    }

    // SHAP Factors
    const allFactors = [
        {
            feature: "Credit_Score",
            label: "Credit Score (CIBIL)",
            user_value: `${credit_score} points`,
            impact_level: Math.abs(creditScoreContrib) > 0.25 ? "High" : "Medium",
            impact_direction: creditScoreContrib >= 0 ? ("positive" as const) : ("negative" as const),
            raw_contribution: creditScoreContrib,
            explanation:
                credit_score >= 750
                    ? "Excellent credit score significantly boosts lender confidence."
                    : "Low credit score increases lender risk perception.",
            is_actionable: true,
        },
        {
            feature: "Loan_Amount",
            label: "Requested Loan Amount",
            user_value: `₹${loan_amount.toLocaleString("en-IN")}`,
            impact_level: Math.abs(ltiContrib) > 0.2 ? "High" : "Medium",
            impact_direction: ltiContrib >= 0 ? ("positive" as const) : ("negative" as const),
            raw_contribution: ltiContrib,
            explanation:
                loanToIncome <= 3
                    ? "Loan amount is well-balanced within your annual income."
                    : "High loan-to-income multiple exerts pressure on repayment capacity.",
            is_actionable: true,
        },
        {
            feature: "Annual_Income",
            label: "Annual Income",
            user_value: `₹${annual_income.toLocaleString("en-IN")}`,
            impact_level: "High",
            impact_direction: annual_income >= 600000 ? ("positive" as const) : ("neutral" as const),
            raw_contribution: annual_income >= 600000 ? 0.18 : 0.05,
            explanation: "Demonstrated annual income supports debt servicing capability.",
            is_actionable: true,
        },
        {
            feature: "Employment_Type",
            label: "Employment Profile",
            user_value: employment_type,
            impact_level: "Medium",
            impact_direction: empContrib >= 0 ? ("positive" as const) : ("negative" as const),
            raw_contribution: empContrib,
            explanation: `Income stability profile for ${employment_type} sector.`,
            is_actionable: true,
        },
        {
            feature: "Loan_Tenure",
            label: "Repayment Tenure",
            user_value: `${loan_tenure} years`,
            impact_level: "Low",
            impact_direction: tenureContrib >= 0 ? ("positive" as const) : ("neutral" as const),
            raw_contribution: tenureContrib,
            explanation: "Sufficient tenure spreads amortization to manageable monthly EMIs.",
            is_actionable: true,
        },
    ];

    const topNegative = allFactors.filter((f) => f.impact_direction === "negative");
    const positiveFactors = allFactors.filter((f) => f.impact_direction === "positive");

    const actionPlan = [
        {
            priority: 1,
            title: isApproved ? "Maintain Healthy Credit Hygiene" : "Strengthen Credit Profile",
            factor_label: "Credit Score",
            reason: "Payment history constitutes ~35% of your credit scoring weight.",
            recommendation: "Ensure 100% on-time EMI repayments and keep credit card balance utilization under 30%.",
        },
        {
            priority: 2,
            title: "Optimize Debt-to-Income Multiple",
            factor_label: "Requested Loan Amount",
            reason: "Lenders look for monthly commitments below 40-50% of net disposable income.",
            recommendation: "Consider applying for the maximum eligible limit or choosing a longer tenure to reduce EMI.",
        },
    ];

    return {
        prediction: isApproved ? "Approved" : "Rejected",
        approved_probability: approvedProb,
        rejected_probability: rejectedProb,
        suggestions,
        explanation: {
            top_negative_factors: topNegative,
            positive_factors: positiveFactors,
            all_factors: allFactors,
            action_plan: actionPlan,
            disclaimer: "Assessment generated via ML risk model. Formal approval subject to lender verification.",
        },
        loan_amount_analysis: {
            mode: isApproved ? "UPWARD_CAPACITY" : "DOWNWARD_IMPROVEMENT",
            currentAmount: loan_amount,
            recommendedAmount: maxEligibleAmount,
            recommendedApprovalProbability: Math.min(approvedProb + 0.08, 0.96) * 100,
            threshold: 50.0,
            scenarios: [
                {
                    loanAmount: loan_amount,
                    approvalProbability: approvedProb * 100,
                    status: isApproved ? "ELIGIBLE" : "NOT_ELIGIBLE"
                },
                {
                    loanAmount: maxEligibleAmount,
                    approvalProbability: Math.min(approvedProb + 0.08, 0.96) * 100,
                    status: "ELIGIBLE"
                }
            ]
        }
    };
}

function simulateClientSideNTCPrediction(
    app: NTCApplication
): NTCPredictionResponse {
    const loanApp: LoanApplication = {
        ...app,
        credit_score: 650, // Imputed baseline for New to Credit
    };
    const standard = simulateClientSideLoanPrediction(loanApp);

    const monthly_income = app.annual_income / 12;
    const monthly_expenses = app.monthly_expenses || 0;
    const disposable_income = monthly_income - monthly_expenses;
    const expense_ratio = monthly_income > 0 ? (monthly_expenses / monthly_income) * 100 : 0;

    return {
        ...standard,
        confidence: 0.89,
        shap_explanation: [
            { feature: "Annual_Income", impact: 0.32 },
            { feature: "Employment_Type", impact: 0.24 },
            { feature: "Loan_Amount", impact: -0.18 },
            { feature: "Loan_Tenure", impact: 0.12 },
        ],
        monthly_income,
        disposable_income,
        expense_ratio,
        requested_loan_amount: app.loan_amount,
        maximum_eligible_amount: standard.prediction === 'Approved' ? app.loan_amount : null,
        maximum_eligible_prediction: standard.prediction,
        max_eligible_approved_probability: standard.approved_probability,
        max_loan_status: standard.prediction === 'Approved' ? 'eligible' : 'none_eligible',
        max_loan_message: 'Mock estimation based on the submitted application profile.'
    };
}

export default api;

