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
}

export interface ValidationResponse {
  status: string;

  message: string;

  data: LoanApplication;
}
export interface NTCApplication {
  dependents: number;

  employment_type:
    | "Private"
    | "Government"
    | "Self-Employed"
    | "Unemployed"
    | "Skilled Labor";

  annual_income: number;

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

export interface NTCShapExplanation {
  feature: string;
  impact: number;
}

export interface NTCPredictionResponse
  extends PredictionResponse {
  confidence: number;
  shap_explanation: NTCShapExplanation[];
}
