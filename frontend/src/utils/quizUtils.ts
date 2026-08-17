import type {
  CategoryPerformance,
  QuizCategory,
  QuizQuestion,
  QuizSummary,
} from "../types/quiz";

export const QUIZ_CATEGORIES: QuizCategory[] = [
  "CIBIL & Credit Score",
  "Loans",
  "EMI & Interest",
  "Loan Eligibility",
  "Financial Awareness",
];

/**
 * Fisher-Yates array shuffler
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Select exactly 2 questions per category from the question bank.
 * Shuffles options while keeping correctOptionIndex accurate.
 */
export function generateRandomQuiz(allQuestions: QuizQuestion[]): QuizQuestion[] {
  const selectedQuestions: QuizQuestion[] = [];

  for (const category of QUIZ_CATEGORIES) {
    const categoryQuestions = allQuestions.filter(
      (q) => q.category === category
    );

    const shuffled = shuffleArray(categoryQuestions);
    const sampled = shuffled.slice(0, 2);

    // Shuffle options for each sampled question to prevent memorizing option position
    for (const q of sampled) {
      const correctOptionText = q.options[q.correctOptionIndex];
      const shuffledOptions = shuffleArray(q.options) as [
        string,
        string,
        string,
        string
      ];
      const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

      selectedQuestions.push({
        ...q,
        options: shuffledOptions,
        correctOptionIndex: newCorrectIndex,
      });
    }
  }

  // Shuffle the final 10 questions so categories are intermixed
  return shuffleArray(selectedQuestions);
}

/**
 * Calculate comprehensive quiz summary and metrics
 */
export function calculateQuizSummary(
  questions: QuizQuestion[],
  answers: Record<string, number>
): QuizSummary {
  let correctCount = 0;

  const categoryMap: Record<
    QuizCategory,
    { total: number; correct: number }
  > = {
    "CIBIL & Credit Score": { total: 0, correct: 0 },
    Loans: { total: 0, correct: 0 },
    "EMI & Interest": { total: 0, correct: 0 },
    "Loan Eligibility": { total: 0, correct: 0 },
    "Financial Awareness": { total: 0, correct: 0 },
  };

  const incorrectQuestions: QuizSummary["incorrectQuestions"] = [];

  for (const q of questions) {
    const selected = answers[q.id];
    const isCorrect = selected !== undefined && selected === q.correctOptionIndex;

    if (categoryMap[q.category]) {
      categoryMap[q.category].total += 1;
    }

    if (isCorrect) {
      correctCount += 1;
      if (categoryMap[q.category]) {
        categoryMap[q.category].correct += 1;
      }
    } else {
      incorrectQuestions.push({
        question: q,
        userSelectedOption: selected,
      });
    }
  }

  const scorePercentage = Math.round((correctCount / Math.max(questions.length, 1)) * 100);

  let grade: QuizSummary["grade"] = "Beginner";
  let gradeTitle = "Financial Novice";
  let feedback = "A good first attempt. Review the core concepts and retry to build your financial confidence!";

  if (scorePercentage >= 90) {
    grade = "Expert";
    gradeTitle = "Financial Maestro 🏆";
    feedback = "Exceptional financial literacy! You have a deep understanding of loans, credit scoring, EMIs, and personal finance.";
  } else if (scorePercentage >= 70) {
    grade = "Proficient";
    gradeTitle = "Credit Savvy 🌟";
    feedback = "Great performance! You have strong grasp over key lending principles and credit management.";
  } else if (scorePercentage >= 50) {
    grade = "Developing";
    gradeTitle = "Growing Knowledge 💡";
    feedback = "Solid foundation! A few revisions on interest calculations and eligibility guidelines will boost your score.";
  }

  const categoryBreakdown: CategoryPerformance[] = QUIZ_CATEGORIES.map((category) => {
    const stats = categoryMap[category] || { total: 2, correct: 0 };
    return {
      category,
      total: stats.total,
      correct: stats.correct,
      percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    };
  });

  return {
    totalQuestions: questions.length,
    correctCount,
    scorePercentage,
    grade,
    gradeTitle,
    feedback,
    categoryBreakdown,
    incorrectQuestions,
  };
}

export function getCategoryBadgeColor(category: QuizCategory): {
  bg: string;
  color: string;
  border: string;
} {
  switch (category) {
    case "CIBIL & Credit Score":
      return { bg: "rgba(0, 166, 206, 0.12)", color: "#0088AA", border: "rgba(0, 166, 206, 0.25)" };
    case "Loans":
      return { bg: "rgba(63, 107, 78, 0.12)", color: "#2B6E44", border: "rgba(63, 107, 78, 0.25)" };
    case "EMI & Interest":
      return { bg: "rgba(217, 119, 87, 0.12)", color: "#C05634", border: "rgba(217, 119, 87, 0.25)" };
    case "Loan Eligibility":
      return { bg: "rgba(107, 70, 193, 0.12)", color: "#6B46C1", border: "rgba(107, 70, 193, 0.25)" };
    case "Financial Awareness":
      return { bg: "rgba(43, 58, 46, 0.12)", color: "#2B3A2E", border: "rgba(43, 58, 46, 0.25)" };
    default:
      return { bg: "rgba(0, 0, 0, 0.05)", color: "inherit", border: "rgba(0, 0, 0, 0.1)" };
  }
}
