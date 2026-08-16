export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  suggestions?: string[];
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
  history?: Array<{
    role: string;
    content: string;
  }>;
  context?: {
    credit_score?: number;
    annual_income?: number;
    loan_amount?: number;
    loan_tenure?: number;
    employment_type?: string;
    dependents?: number;
    education?: string;
    prediction?: string;
    approved_probability?: number;
  };
}

export interface ChatResponse {
  reply: string;
  suggestions: string[];
  model: string;
  status: string;
}

export interface SuggestedPrompt {
  title: string;
  prompt: string;
  category: "Loan Approval Queries" | "Credit Score Queries" | "EMI & Planning" | string;
  icon?: string;
}

export interface SuggestionsResponse {
  categories: string[];
  suggestions: SuggestedPrompt[];
}
