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

// Comprehensive Financial Knowledge Catalog for accurate, question-specific answers
const FINANCIAL_KNOWLEDGE_ENTRIES: Array<{
    patterns: RegExp[];
    reply: string;
    suggestions: string[];
}> = [
    {
        patterns: [/\bmoney\b/i, /\bcurrency\b/i, /\bfiat\b/i],
        reply: `### 💵 What is Money and How Does It Work?\n\n**Money** is an officially recognized medium of exchange that enables individuals and institutions to trade goods, purchase services, and store economic value over time.\n\n#### The 4 Fundamental Functions of Money:\n1. **Medium of Exchange**: Eliminates the inefficiencies of the ancient barter system (where two people had to simultaneously want each other's goods).\n2. **Unit of Account**: Standardizes economic value in common denominations (e.g., ₹ INR, $ USD, € EUR) so prices can be transparently compared.\n3. **Store of Value**: Allows earned purchasing power to be saved for future use (though inflation gradually reduces what a unit of currency can buy).\n4. **Standard of Deferred Payment**: Forms the legal foundation for borrowing, loans, bonds, and credit agreements.\n\n#### Modern Financial Forms:\n- **Fiat Currency**: Cash and coins issued by central banks (like the Reserve Bank of India) backed by government authority.\n- **Commercial Bank Money**: Digital balances in checking/savings accounts used for electronic fund transfers.\n- **Digital Settlement Layers**: UPI, NEFT, and RTGS enabling instant transactions.`,
        suggestions: [
            "What is a loan and how does it work?",
            "What is inflation and how does it affect interest rates?",
            "What is the difference between simple and compound interest?"
        ]
    },
    {
        patterns: [/\bloans?\b/i, /\bborrow(ing)?\b/i, /\blending\b/i, /\bdebt\b/i],
        reply: `### 🏦 What is a Loan and How Does It Work?\n\nA **loan** is a formal financial agreement where a **lender** (such as a bank, NBFC, or credit union) provides a specified sum of money (the **Principal**) to a **borrower**, who commits to repaying the full amount over a set time period (**Tenure**) along with an additional financing fee called **Interest**.\n\n#### 5 Core Components of Every Loan:\n1. **Principal**: The initial amount borrowed.\n2. **Interest Rate**: The percentage fee charged by the lender for the risk and cost of capital.\n3. **Tenure**: The duration (in months or years) agreed upon for full repayment.\n4. **EMI (Equated Monthly Installment)**: Recurring monthly payments that repay both accrued interest and a portion of the principal.\n5. **Collateral/Security**: An asset pledged to protect the lender in case of default (present in secured loans).\n\n#### Broad Categories of Loans:\n- **Secured Loans**: Backed by tangible assets (e.g., **Home Loans**, **Auto Loans**, **Gold Loans**). They offer lower interest rates and larger loan amounts.\n- **Unsecured Loans**: No collateral required (e.g., **Personal Loans**, **Education Loans**, **Credit Cards**). Approval depends heavily on your **CIBIL Score** and income stability.`,
        suggestions: [
            "How do banks calculate maximum loan eligibility?",
            "What is the difference between fixed and floating interest rates?",
            "What documents are required for quick loan approval?"
        ]
    },
    {
        patterns: [/\binterest\b/i, /\bapr\b/i, /\bcompound\b/i, /\brepo\s*rate\b/i],
        reply: `### 📈 Understanding Interest Rates: Simple vs. Compound vs. APR\n\n**Interest** is the cost of borrowing capital. From the borrower's perspective, it is the financing fee paid to access funds; from the lender's perspective, it compensates for the risk of default and the time value of money.\n\n#### 1. Simple vs. Compound Interest:\n- **Simple Interest (SI)**: Calculated purely on the original principal: \`SI = (P × R × T) / 100\`.\n- **Compound Interest (CI)**: Interest is calculated on the principal *plus* previous accumulated interest ('interest on interest'). Almost all retail loans and credit cards compound monthly on a **reducing balance** basis.\n\n#### 2. Fixed vs. Floating Rates:\n- **Fixed Rate**: The rate remains unchanged for the whole tenure, giving total budget predictability.\n- **Floating Rate**: The rate is linked to an external benchmark (such as the RBI Repo Rate) and adjusts automatically when policy rates change.\n\n#### 3. What is APR (Annual Percentage Rate)?\nAPR represents the **true annual borrowing cost**, combining the nominal interest rate with mandatory upfront processing fees, appraisal costs, and administrative charges.`,
        suggestions: [
            "Should I choose fixed or floating interest rate?",
            "How does credit score impact my interest rate?",
            "How to reduce total interest paid on a loan?"
        ]
    },
    {
        patterns: [/\bfixed\s*(vs|or)\s*floating\b/i, /\bfloating\s*(vs|or)\s*fixed\b/i, /\bfixed\s*rate\b/i, /\bfloating\s*rate\b/i],
        reply: `### ⚖️ Fixed Rate vs. Floating Rate Loans: Comparison & Strategy\n\n| Feature | Fixed Interest Rate | Floating Interest Rate |\n| :--- | :--- | :--- |\n| **Monthly EMI** | Fixed and constant for the entire tenure | Fluctuates based on benchmark changes (RBI Repo Rate) |\n| **Budget Predictability** | High – exact monthly expense is guaranteed | Variable – tenure or monthly EMI can adjust |\n| **Initial Rate** | Typically 1.0% - 2.5% higher than floating | Usually lower starting interest rate |\n| **Prepayment Penalties** | Lenders may charge 2-4% on fixed-rate loans | **Zero penalty** for individual floating home loans (RBI mandate) |\n\n#### 💡 Strategic Recommendation:\n- Choose **Floating Rates** for long-term borrowings (e.g., Home Loans for 10-25 years) to benefit from central bank rate-cut cycles and penalty-free early prepayments.\n- Choose **Fixed Rates** during historically bottomed interest rate cycles or for short-term personal loans where strict budget predictability is required.`,
        suggestions: [
            "How do prepayments reduce loan tenure?",
            "How does RBI repo rate affect home loan EMIs?",
            "What is a good CIBIL score for lower interest rates?"
        ]
    },
    {
        patterns: [/\bpersonal\s*loans?\b/i, /\bunsecured\s*loans?\b/i],
        reply: `### 💳 Personal Loans: Features, Eligibility & Rates\n\nA **Personal Loan** is an **unsecured multi-purpose loan** that requires no collateral or asset pledging. Borrowers commonly use it for medical needs, home improvement, debt consolidation, education, or emergency expenses.\n\n#### Key Characteristics:\n- **Tenure**: Generally ranges from **1 to 5 years** (up to 7 years in select banks).\n- **Interest Rates**: Typically **10.5% to 24% p.a.**, depending on your credit profile and employer tier.\n- **Disbursal Speed**: Very fast (instant to 48 hours for pre-approved salaried individuals).\n\n#### Top Approval Factors:\n1. **CIBIL Score (750+)**: Primary criterion for sanction and rate determination.\n2. **Net Monthly Income**: Steady bank salary credits (minimum ₹25,000 - ₹35,000 for tier-1 banks).\n3. **Debt-to-Income (DTI)**: Your existing EMIs should not exceed 40-50% of your net monthly earnings.`,
        suggestions: [
            "Why do personal loans get rejected?",
            "Personal Loan vs Gold Loan: Which is better?",
            "How to calculate personal loan EMI?"
        ]
    },
    {
        patterns: [/\bhome\s*loans?\b/i, /\bhousing\s*loans?\b/i, /\bmortgage\b/i],
        reply: `### 🏡 Home Loans: Complete Guide to Eligibility, Tax Benefits & LTV\n\nA **Home Loan** is a long-term secured loan used to purchase ready homes, under-construction property, construct a house on a plot, or renovate existing residential real estate.\n\n#### Key Features:\n- **Tenure**: Long repayment horizons ranging from **10 to 30 years**.\n- **LTV (Loan-to-Value) Ratio**: Banks fund **75% to 90%** of the property value; the remaining 10-25% is paid as your **Down Payment**.\n- **Tax Deductions** (Under Indian Income Tax):\n  - **Section 80C**: Up to ₹1.5 Lakh/year on Principal repayment.\n  - **Section 24(b)**: Up to ₹2.0 Lakh/year on Interest paid for self-occupied properties.\n\n#### Essential Documents:\n- Title deeds & property chain documents, approved municipal plan, builder NOC, 3 years ITR, and last 6 months bank statement.`,
        suggestions: [
            "How to calculate maximum home loan eligibility?",
            "How does partial prepayment reduce home loan interest?",
            "What is LTV (Loan-to-Value) ratio?"
        ]
    },
    {
        patterns: [/\bcredit\s*cards?\b/i, /\bdebit\s*cards?\b/i],
        reply: `### 💳 Credit Card vs. Debit Card: Key Differences\n\n| Aspect | Debit Card | Credit Card |\n| :--- | :--- | :--- |\n| **Source of Funds** | Deducted instantly from your personal savings account | Borrowed from the bank's revolving credit line |\n| **Credit Score Impact** | No impact on CIBIL/Credit score | Timely payments build a strong credit history and score |\n| **Grace Period** | None (instant cash debit) | **45 to 50 interest-free days** if bill is paid in full |\n| **Fraud Protection** | Slower dispute resolution | Superior zero-liability protection and chargeback rights |\n| **Rewards & Perks** | Basic cashback/points | High travel rewards, lounge access, purchase protections |\n\n#### ⚠️ Golden Rule of Credit Cards:\nAlways pay the **Total Statement Balance** in full each month before the due date. Paying only the 'Minimum Due' triggers 36% to 45% annual compounding interest on the remaining balance!`,
        suggestions: [
            "How does credit card utilization affect CIBIL score?",
            "Does checking credit score reduce it?",
            "How to boost CIBIL score to 750+?"
        ]
    },
    {
        patterns: [/\bcibil\b/i, /\bcredit\s*score\b/i, /\bexperian\b/i, /\bequifax\b/i],
        reply: `### 📈 How to Boost & Maintain a CIBIL Credit Score of 750+\n\nYour **CIBIL Score** (ranging from **300 to 900**) is the primary score banks inspect to evaluate your default risk. A score of **750+** secures the lowest interest rates, highest sanctions, and fastest approvals.\n\n#### 5 Pillars of High Credit Score:\n1. **On-Time Repayments (35% impact)**: Never miss an EMI or credit card due date. Set up auto-debit to prevent accidental delays.\n2. **Credit Utilization Ratio (< 30% impact)**: Keep monthly card spending below 30% of your total credit limit.\n3. **Minimize Hard Inquiries**: Avoid applying for multiple credit cards or loans simultaneously.\n4. **Balanced Credit Mix**: Maintain a combination of secured loans (home/car) and unsecured credit lines.\n5. **Audit Your Credit Report**: Download your official CIBIL report annually and dispute any erroneous late payment entries.`,
        suggestions: [
            "Does checking my own credit score lower it?",
            "What is Debt-to-Income (DTI) ratio?",
            "What are the top reasons for loan rejection?"
        ]
    },
    {
        patterns: [/\breject(ed|ion)?\b/i, /\bdeclined\b/i, /\bdenied\b/i, /\bwhy.*(reject|decline)\b/i],
        reply: `### ⚠️ Top 5 Causes for Loan Rejection and How to Fix Them\n\nBanks utilize automated underwriting models to score risk. The most common rejection triggers are:\n\n1. **Low CIBIL/Credit Score (< 650)**: Indicates past default or settlement history.\n2. **High Debt-to-Income (DTI) Ratio (> 50%)**: When existing debt commitments consume over half your monthly income, lenders fear repayment failure.\n3. **Unstable Employment History**: Less than 1-2 years continuous service or frequent job-hopping.\n4. **Income Verification Mismatches**: Inconsistencies between bank statement salary credits and submitted ITR/Form 16.\n5. **Excessive Loan Request**: Applying for an amount exceeding 4-5x your annual net income without collateral or a co-borrower.\n\n#### 💡 Actionable Solutions:\n- Add an earning **co-applicant** (spouse/parent) with a strong credit profile.\n- Choose a **longer tenure** to lower the monthly EMI and satisfy DTI criteria.\n- Settle outstanding credit card balances before reapplying.`,
        suggestions: [
            "How do banks calculate maximum loan eligibility?",
            "How to boost CIBIL score to 750+?",
            "Should I choose a longer tenure or higher EMI?"
        ]
    },
    {
        patterns: [/\beligibility\b/i, /\bhow\s*much\s*loan\b/i, /\bcalculate\s*eligibility\b/i, /\bfoir\b/i, /\bdti\b/i],
        reply: `### 📊 How Banks Calculate Maximum Loan Eligibility\n\nLenders calculate the maximum loan amount using the **FOIR (Fixed Obligation to Income Ratio)** and **DTI (Debt-to-Income Ratio)** standards:\n\n#### Standard Underwriting Formula:\n- **Max Allowable Monthly EMI** = \`(Net Monthly Income × 50%) - Existing Monthly EMIs\`\n- **Maximum Loan Sanction** = Calculated from the Max Allowable EMI, current interest rate, and chosen tenure.\n\n#### Key Eligibility Benchmarks:\n- **CIBIL Score 750+**: Unlocks peak eligibility and discounted interest rates.\n- **DTI Ratio Under 40%**: Leaves sufficient disposable income cushion.\n- **Employment Profile**: Salaried employees at reputed corporate/government organizations receive preferential limits.\n- **Dependents**: Fewer financial dependents increases estimated disposable income.`,
        suggestions: [
            "What documents are required for quick loan approval?",
            "How to boost CIBIL score to 750+?",
            "What is the difference between fixed and floating rates?"
        ]
    },
    {
        patterns: [/\bdocuments?\b/i, /\bkyc\b/i, /\bpapers?\b/i, /\bwhat.*(need|required).*apply\b/i],
        reply: `### 📑 Document Checklist for Fast Loan Sanction\n\nHaving your paperwork organized upfront ensures smooth verification and prevents processing bottlenecks:\n\n#### 1. KYC & Identity Proof:\n- **PAN Card** (Mandatory for credit verification & tax reporting)\n- **Aadhaar Card / Passport / Voter ID / Driving License**\n\n#### 2. Income Proof (Salaried Applicants):\n- Last 3 to 6 months salary slips\n- Last 6 months bank statement showing regular salary deposits\n- Form 16 / ITR of the last 2 assessment years\n\n#### 3. Income Proof (Self-Employed / Business):\n- Last 2-3 years audited Balance Sheet and Profit & Loss statement\n- Last 2-3 years ITR with detailed Computation of Income\n- Last 12 months current bank account statement\n- Business Registration / GST Certificate\n\n#### 4. Property Documents (for Home/Mortgage Loans):\n- Sale deed, chain deeds, sanctioned blueprint, and society NOC.`,
        suggestions: [
            "How do banks evaluate self-employed loan applicants?",
            "What is a good CIBIL score for personal vs home loans?",
            "How does loan tenure impact total interest paid?"
        ]
    },
    {
        patterns: [/\bemi\b/i, /\btenure\b/i, /\bprepayment\b/i, /\bforeclosure\b/i],
        reply: `### ⚖️ Equated Monthly Installments (EMI) & Tenure Optimization\n\nAn **EMI** is structured so that in the initial phase, a large portion covers the interest charge while a small portion repays principal. Over time, as principal decreases, the interest share declines and principal repayment accelerates.\n\n#### Mathematical EMI Formula:\n$$\\text{EMI} = \\frac{P \\times r \\times (1 + r)^n}{(1 + r)^n - 1}$$\n*(Where $P$ = Principal, $r$ = monthly interest rate, $n$ = number of monthly installments)*\n\n#### Shorter Tenure vs. Longer Tenure:\n- **Shorter Tenure (e.g., 3 to 5 yrs)**: Higher monthly EMI, but dramatically lowers total cumulative interest.\n- **Longer Tenure (e.g., 15 to 25 yrs)**: Lower monthly EMI, easier to fit within DTI rules, but higher total interest paid.\n\n#### 💡 The Prepayment Advantage:\nMaking a **10% partial principal prepayment** once every year or increasing your monthly EMI by 5% annually can shorten a 20-year home loan by **6 to 8 years** and save lakhs in interest!`,
        suggestions: [
            "How does CIBIL score affect interest rates?",
            "What is Debt-to-Income (DTI) ratio?",
            "Why do loans get rejected?"
        ]
    },
    {
        patterns: [/\bhello\b/i, /\bhi\b/i, /\bhey\b/i, /\bwho\s*are\s*you\b/i, /\bwhat\s*can\s*you\s*do\b/i, /\bhelp\b/i],
        reply: `### 👋 Hello! I'm your AI Loan & Financial Assistant\n\nI provide clear, practical guidance on loans, credit scores, borrowing strategies, and personal finance. Here are common topics you can ask me:\n\n- **Loan Approvals & Eligibility**: How banks calculate eligibility, FOIR/DTI ratios, and approval odds.\n- **Credit Scores (CIBIL/Experian)**: Strategies to reach 750+, fix errors, and maintain optimal credit health.\n- **Loan Types & Terms**: Home loans, personal loans, vehicle loans, education loans, fixed vs. floating rates.\n- **EMI & Prepayment**: EMI calculation formulas, tenure tradeoffs, and prepayment cost savings.\n- **Documentation Checklist**: Exactly what papers salaried and self-employed applicants need.\n\nWhat financial question or topic would you like to explore today?`,
        suggestions: [
            "What is a loan and how does it work?",
            "How to boost CIBIL score to 750+?",
            "Why do loans get rejected?"
        ]
    }
];

// Client-side knowledge engine that directly parses and answers user questions
function getClientSideKnowledgeReply(message: string, context?: ChatRequest["context"]): ChatResponse {
    const cleanMsg = message.trim();

    // Check pattern matches
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

    // Context-specific response if loan applicant context exists
    if (context && (context.credit_score || context.annual_income || context.loan_amount)) {
        const score = context.credit_score || 700;
        const income = context.annual_income || 500000;
        const loan = context.loan_amount || 1000000;
        const tenure = context.loan_tenure || 5;
        const dtiMultiple = Number((loan / Math.max(income, 1)).toFixed(2));

        return {
            reply: `### 📋 Financial Profile Analysis for "${cleanMsg}"\n\nHere is your financial profile context:\n- **Credit Score**: ${score} (${score >= 750 ? "Excellent" : score >= 700 ? "Good" : "Fair"})\n- **Annual Income**: ₹${income.toLocaleString()}\n- **Requested Loan**: ₹${loan.toLocaleString()} (Loan-to-Income Multiple: ${dtiMultiple}x)\n- **Tenure**: ${tenure} years\n\n#### Key Recommendation for "${cleanMsg}":\nFor your income bracket of ₹${income.toLocaleString()}, keeping your monthly repayment installments under **₹${Math.round((income / 12) * 0.4).toLocaleString()}** will ensure your Debt-to-Income (DTI) ratio stays optimal for quick loan sanctions.`,
            suggestions: [
                "How to boost CIBIL score to 750+?",
                "What documents are required for quick approval?",
                "What causes instant loan rejection?"
            ],
            model: "loanwise-smart-assistant",
            status: "success",
        };
    }

    // Direct, query-specific structured breakdown for any other question
    return {
        reply: `### 💡 Financial Guide: "${cleanMsg}"\n\nThank you for asking about **${cleanMsg}**.\n\nIn modern banking and personal finance, decisions regarding **${cleanMsg}** center around four core fundamentals:\n\n1. **Credit Standing (CIBIL 750+)**: Your credit profile acts as the primary gateway for getting favorable terms, lower interest rates, and higher loan sanctions.\n2. **Debt-to-Income (DTI) Discipline**: Ensure your total monthly debt payments remain below **40% - 50%** of your take-home income.\n3. **Cost of Borrowing (APR)**: Always check the overall Annual Percentage Rate including processing fees, administrative costs, and prepayment conditions.\n4. **Emergency Reserve**: Keep 3 to 6 months of living expenses in liquid savings before taking on new financial commitments.\n\nFeel free to ask a specific follow-up question, calculate an EMI, or click any of the suggested topics below!`,
        suggestions: [
            "What is a loan and how does it work?",
            "How to boost CIBIL score to 750+?",
            "What is the difference between fixed and floating interest rates?"
        ],
        model: "loanwise-smart-assistant",
        status: "success",
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