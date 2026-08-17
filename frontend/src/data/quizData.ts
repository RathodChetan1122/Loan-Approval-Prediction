import type { QuizQuestion } from "../types/quiz";

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // ==========================================
  // Category 1: CIBIL & Credit Score
  // ==========================================
  {
    id: "cibil-1",
    category: "CIBIL & Credit Score",
    difficulty: "Easy",
    question: "What is the standard score range for CIBIL credit scores in India?",
    options: [
      "100 to 1000",
      "300 to 900",
      "500 to 1000",
      "0 to 100",
    ],
    correctOptionIndex: 1,
    explanation:
      "In India, CIBIL scores range between 300 and 900. A score of 750 and above is generally considered excellent by most lenders.",
  },
  {
    id: "cibil-2",
    category: "CIBIL & Credit Score",
    difficulty: "Medium",
    question: "What is the recommended maximum Credit Utilization Ratio (CUR) for maintaining a strong credit score?",
    options: [
      "Below 30%",
      "Above 80%",
      "Between 60% and 70%",
      "Exactly 100%",
    ],
    correctOptionIndex: 0,
    explanation:
      "Financial experts and credit bureaus recommend keeping your Credit Utilization Ratio (credit card balance divided by total limit) below 30% to demonstrate responsible credit management.",
  },
  {
    id: "cibil-3",
    category: "CIBIL & Credit Score",
    difficulty: "Hard",
    question: "How does checking your own credit score (a soft inquiry) impact your CIBIL rating?",
    options: [
      "It lowers the score by 5-10 points each time",
      "It has zero impact on your credit score",
      "It immediately increases your score",
      "It temporarily locks your credit file",
    ],
    correctOptionIndex: 1,
    explanation:
      "Checking your own credit score is classified as a 'soft inquiry' and does not impact your credit score at all. Only hard inquiries initiated by lenders during loan applications can affect your score.",
  },
  {
    id: "cibil-4",
    category: "CIBIL & Credit Score",
    difficulty: "Medium",
    question: "Which of the following factors carries the highest weight in determining your CIBIL credit score?",
    options: [
      "Payment history and on-time repayment",
      "Number of credit cards held",
      "Age and gender of the applicant",
      "Annual household electricity bill",
    ],
    correctOptionIndex: 0,
    explanation:
      "Payment history accounts for approximately 35% of your credit score. Timely repayments on loans and credit card bills are the single most influential factor.",
  },

  // ==========================================
  // Category 2: Loans
  // ==========================================
  {
    id: "loans-1",
    category: "Loans",
    difficulty: "Easy",
    question: "What distinguishes a secured loan from an unsecured loan?",
    options: [
      "Secured loans require collateral asset backing, whereas unsecured loans do not",
      "Secured loans never charge any interest",
      "Unsecured loans are only available to government employees",
      "Secured loans have no repayment tenure",
    ],
    correctOptionIndex: 0,
    explanation:
      "A secured loan (e.g., home loan, gold loan, car loan) is backed by collateral which the lender can claim if default occurs. Unsecured loans (e.g., personal loans) do not require collateral.",
  },
  {
    id: "loans-2",
    category: "Loans",
    difficulty: "Medium",
    question: "What does 'Foreclosure' mean in the context of a term loan?",
    options: [
      "Paying off the entire remaining loan balance before the tenure ends",
      "Missing 3 consecutive monthly payments",
      "Transferring your loan to another person without bank approval",
      "Extending the loan tenure by 5 years",
    ],
    correctOptionIndex: 0,
    explanation:
      "Foreclosure (or loan prepayment) is the process of repaying the entire outstanding loan amount in a single payment before the scheduled loan tenure is complete.",
  },
  {
    id: "loans-3",
    category: "Loans",
    difficulty: "Hard",
    question: "What is the primary benefit of making regular prepayments towards the principal on a long-term home loan?",
    options: [
      "It significantly reduces total interest paid and shortens the tenure",
      "It automatically doubles the property value",
      "It converts the loan into an unsecured overdraft",
      "It eliminates the need for property insurance",
    ],
    correctOptionIndex: 0,
    explanation:
      "Prepayments directly reduce the outstanding principal balance. Since interest is calculated on reducing principal, prepayments lead to substantial interest savings and shorten the loan tenure.",
  },
  {
    id: "loans-4",
    category: "Loans",
    difficulty: "Easy",
    question: "Which of the following is typically categorized as an unsecured loan?",
    options: [
      "Personal Loan",
      "Home Loan / Mortgage",
      "Car / Auto Loan",
      "Gold Loan",
    ],
    correctOptionIndex: 0,
    explanation:
      "Personal loans are unsecured because they do not require collateral like property, vehicle, or gold.",
  },

  // ==========================================
  // Category 3: EMI & Interest
  // ==========================================
  {
    id: "emi-1",
    category: "EMI & Interest",
    difficulty: "Easy",
    question: "What does the acronym 'EMI' stand for?",
    options: [
      "Equated Monthly Installment",
      "Equal Money Investment",
      "Estimated Monthly Interest",
      "Early Monetary Income",
    ],
    correctOptionIndex: 0,
    explanation:
      "EMI stands for Equated Monthly Installment. It is a fixed payment amount made by a borrower to a lender at a specified date each calendar month.",
  },
  {
    id: "emi-2",
    category: "EMI & Interest",
    difficulty: "Medium",
    question: "In a standard reducing balance loan amortization schedule, how does the EMI composition change over time?",
    options: [
      "Interest portion decreases while the principal repayment portion increases",
      "Interest portion increases while principal portion decreases",
      "Principal and interest proportions remain identical throughout",
      "Interest is only charged in the final month",
    ],
    correctOptionIndex: 0,
    explanation:
      "In early months, the outstanding principal is high, so the interest component is large. As principal gets repaid over time, interest reduces and a larger share of each EMI goes toward principal repayment.",
  },
  {
    id: "emi-3",
    category: "EMI & Interest",
    difficulty: "Medium",
    question: "What is the difference between a Fixed Interest Rate and a Floating Interest Rate loan?",
    options: [
      "Fixed rate stays constant throughout, while floating rate fluctuates with market benchmark rates (e.g. Repo Rate)",
      "Floating rate is always zero percent",
      "Fixed rate can only be taken for 6 months",
      "Floating rate requires daily cash repayments",
    ],
    correctOptionIndex: 0,
    explanation:
      "A fixed interest rate remains unchanged over the loan tenure providing predictable EMIs. A floating rate changes in response to market benchmarks (like RBI repo rate changes).",
  },
  {
    id: "emi-4",
    category: "EMI & Interest",
    difficulty: "Hard",
    question: "What happens if you choose a longer loan tenure for the same principal and interest rate?",
    options: [
      "Monthly EMI decreases, but the total interest paid across the loan increases",
      "Monthly EMI increases and total interest decreases",
      "Both monthly EMI and total interest decrease",
      "Both monthly EMI and total interest remain unchanged",
    ],
    correctOptionIndex: 0,
    explanation:
      "A longer tenure spreads repayment over more months, lowering your monthly EMI. However, because interest accrues over more years, the total cumulative interest paid is much higher.",
  },

  // ==========================================
  // Category 4: Loan Eligibility
  // ==========================================
  {
    id: "eligibility-1",
    category: "Loan Eligibility",
    difficulty: "Medium",
    question: "What does the 'FOIR' (Fixed Obligation to Income Ratio) or DTI measure in loan appraisal?",
    options: [
      "The percentage of monthly income already committed to debt obligations and EMIs",
      "The applicant's total annual tax refund amount",
      "The ratio of bank branches in the applicant's city",
      "The speed of loan disbursement in hours",
    ],
    correctOptionIndex: 0,
    explanation:
      "FOIR (Fixed Obligation to Income Ratio) measures the portion of an applicant's monthly income that is dedicated to servicing existing loan EMIs and fixed liabilities. Lenders typically prefer FOIR below 40-50%.",
  },
  {
    id: "eligibility-2",
    category: "Loan Eligibility",
    difficulty: "Easy",
    question: "Adding an earning co-applicant (such as a working spouse or parent) to your loan application usually:",
    options: [
      "Increases your total loan eligibility amount",
      "Guarantees instant rejection",
      "Triples the interest rate automatically",
      "Disqualifies you from tax benefits",
    ],
    correctOptionIndex: 0,
    explanation:
      "Adding a creditworthy co-applicant combines both incomes, increasing the total household repayment capacity and consequently boosting eligible loan amount.",
  },
  {
    id: "eligibility-3",
    category: "Loan Eligibility",
    difficulty: "Hard",
    question: "What does the 'LTV' (Loan-to-Value) ratio represent in property or vehicle loans?",
    options: [
      "The percentage of property/asset value that the bank is willing to finance as a loan",
      "The total life expectancy of the borrower",
      "The tax bracket of the borrower",
      "The maximum number of co-borrowers permitted",
    ],
    correctOptionIndex: 0,
    explanation:
      "LTV (Loan-to-Value) is the ratio of loan amount to the appraised value of the asset. For example, an 80% LTV on a ₹50 Lakh home means the lender provides ₹40 Lakhs as a loan and the buyer provides ₹10 Lakhs as down payment.",
  },
  {
    id: "eligibility-4",
    category: "Loan Eligibility",
    difficulty: "Medium",
    question: "Which of the following would most likely lead to a loan application being rejected?",
    options: [
      "A history of frequent 90+ days payment defaults and high existing FOIR",
      "Having a stable salary credited to a reputable bank",
      "Maintaining a CIBIL score of 810",
      "Providing complete KYC and verified income tax returns",
    ],
    correctOptionIndex: 0,
    explanation:
      "Past loan defaults, high existing debt obligations (high FOIR), and low credit scores are top reasons financial institutions reject loan applications.",
  },

  // ==========================================
  // Category 5: Financial Awareness
  // ==========================================
  {
    id: "fin-1",
    category: "Financial Awareness",
    difficulty: "Easy",
    question: "What is an 'Emergency Fund' typically recommended to cover?",
    options: [
      "3 to 6 months of essential living expenses in liquid savings",
      "10 years of speculative stock market investments",
      "Luxury vacation tickets and entertainment only",
      "Only the cost of lottery tickets",
    ],
    correctOptionIndex: 0,
    explanation:
      "An emergency fund should hold 3 to 6 months' worth of essential living expenses in readily accessible, liquid accounts to protect against unexpected medical bills or sudden job loss without taking high-interest debt.",
  },
  {
    id: "fin-2",
    category: "Financial Awareness",
    difficulty: "Medium",
    question: "What is 'Inflation' and how does it affect purchasing power over time?",
    options: [
      "The general increase in prices over time, which decreases the purchasing power of money",
      "A decrease in all commodity prices making goods cheaper",
      "The interest rate banks pay on fixed deposits",
      "A government scheme for free credit cards",
    ],
    correctOptionIndex: 0,
    explanation:
      "Inflation represents the continuous rise in price levels over time. As inflation increases, each unit of currency buys fewer goods and services, reducing purchasing power.",
  },
  {
    id: "fin-3",
    category: "Financial Awareness",
    difficulty: "Hard",
    question: "What is the 'Rule of 72' used for in personal finance?",
    options: [
      "Estimating the approximate number of years needed to double an investment at a given annual interest rate (72 / Rate)",
      "Calculating the maximum age for getting a credit card",
      "Determining the minimum number of mutual funds to buy",
      "Calculating annual vehicle depreciation",
    ],
    correctOptionIndex: 0,
    explanation:
      "The Rule of 72 is a mental shortcut to estimate how many years it takes for an investment to double at a fixed annual rate of return: Years to Double ≈ 72 ÷ Annual Interest Rate.",
  },
  {
    id: "fin-4",
    category: "Financial Awareness",
    difficulty: "Medium",
    question: "What is the primary difference between a Credit Card and a Debit Card?",
    options: [
      "Debit card deducts money directly from your bank balance; credit card borrows money up to a credit limit to be repaid later",
      "Credit cards can only be used in ATMs",
      "Debit cards charge 40% annual interest on every transaction",
      "There is no difference between the two",
    ],
    correctOptionIndex: 0,
    explanation:
      "A debit card draws directly from funds available in your bank account. A credit card provides a short-term revolving line of credit from the bank that must be repaid by the billing due date.",
  },
];
