export interface LoanApplication {
  dependents: number;

  employment_type:
    | "Private"
    | "Government"
    | "Self-Employed"
    | "Unemployed"
    | "Skilled Labor";

  annual_income: number;

  credit_score: number;

  loan_amount: number;

  loan_tenure: number;

  education:
    | "Graduate"
    | "Post Graduate"
    | "PhD"
    | "High School"
    | "Diploma"
    | "No Formal";
}

export interface PredictionResponse {
  prediction:
    | "Approved"
    | "Rejected";

  approved_probability: number;

  rejected_probability: number;

  suggestions: string[];

  requested_loan_amount?: number;

  maximum_eligible_amount?: number;

  maximum_eligible_prediction?: "Approved" | "Rejected";

  max_eligible_approved_probability?: number;

  max_loan_status?: "eligible" | "none_eligible" | "max_limit_reached";

  max_loan_message?: string;
}

export interface MaxLoanEstimateResponse {
  requested_loan_amount: number;

  maximum_eligible_amount: number;

  maximum_eligible_prediction: "Approved" | "Rejected";

  max_eligible_approved_probability: number;

  max_loan_status: "eligible" | "none_eligible" | "max_limit_reached";

  max_loan_message: string;
}

export interface ValidationResponse {
  status: string;

  message: string;

  data: LoanApplication;
}