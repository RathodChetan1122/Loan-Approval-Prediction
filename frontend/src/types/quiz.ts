export type QuizCategory =
  | "CIBIL & Credit Score"
  | "Loans"
  | "EMI & Interest"
  | "Loan Eligibility"
  | "Financial Awareness";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation: string;
}

export type QuizStage = "intro" | "active" | "completed" | "review";

export interface CategoryPerformance {
  category: QuizCategory;
  total: number;
  correct: number;
  percentage: number;
}

export interface QuizSummary {
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  grade: "Expert" | "Proficient" | "Developing" | "Beginner";
  gradeTitle: string;
  feedback: string;
  categoryBreakdown: CategoryPerformance[];
  incorrectQuestions: Array<{
    question: QuizQuestion;
    userSelectedOption: number | undefined;
  }>;
}
