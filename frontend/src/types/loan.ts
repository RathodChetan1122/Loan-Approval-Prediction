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

export interface ExplanationFactor {
  feature: string;
  label: string;
  user_value: string;
  impact_level: string;
  impact_direction: "positive" | "negative" | "neutral";
  raw_contribution: number;
  explanation: string;
  is_actionable: boolean;
}

export interface ActionPlanItem {
  priority: number;
  title: string;
  subtitle?: string;
  factor_label: string;
  reason: string;
  recommendation: string;
}

export interface LoanExplanation {
  top_negative_factors: ExplanationFactor[];
  positive_factors: ExplanationFactor[];
  all_factors: ExplanationFactor[];
  action_plan: ActionPlanItem[];
  disclaimer: string;
}

export interface PredictionResponse {
  prediction: "Approved" | "Rejected";

  approved_probability: number;

  rejected_probability: number;

  suggestions: string[];

  explanation?: LoanExplanation;

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
export interface NTCApplication {
  dependents: number;

  employment_type:
  | "Private"
  | "Government"
  | "Self-Employed"
  | "Unemployed"
  | "Skilled Labor";

  annual_income: number;
  monthly_expenses: number;
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

export interface NTCPredictionResponse extends PredictionResponse {
  confidence: number;
  shap_explanation: NTCShapExplanation[];
  monthly_income: number;
  disposable_income: number;
  expense_ratio: number;
}
