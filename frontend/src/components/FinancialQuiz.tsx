import { useState } from "react";
import { INITIAL_QUIZ_QUESTIONS } from "../data/quizData";
import type { QuizQuestion, QuizStage } from "../types/quiz";
import {
  calculateQuizSummary,
  generateRandomQuiz,
  getCategoryBadgeColor,
  QUIZ_CATEGORIES,
} from "../utils/quizUtils";

interface FinancialQuizProps {
  onBack: () => void;
  onStartAssessment: () => void;
}

export default function FinancialQuiz({
  onBack,
  onStartAssessment,
}: FinancialQuizProps) {
  const [stage, setStage] = useState<QuizStage>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect">("all");

  const startQuiz = () => {
    const selected = generateRandomQuiz(INITIAL_QUIZ_QUESTIONS);
    setQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setStage("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinishQuiz = () => {
    setStage("completed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const summary = calculateQuizSummary(questions, answers);
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // SVG Circular Gauge calculation
  const circleRadius = 52;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circumference - (summary.scorePercentage / 100) * circumference;

  const scoreStrokeColor =
    summary.scorePercentage >= 80
      ? "#3F6B4E"
      : summary.scorePercentage >= 50
      ? "#D97757"
      : "#B54834";

  return (
    <section className="quiz-wrapper" aria-label="Financial Knowledge Challenge">
      {/* =========================================================================
          STAGE 1: INTRO SCREEN
      ========================================================================== */}
      {stage === "intro" && (
        <div className="quiz-glass-card" style={{ textAlign: "center" }}>
          <div className="quiz-badge-pill">
            <span>🎯 Financial Knowledge Arena</span>
          </div>

          <h1 className="quiz-title">
            Loan &amp; Financial Knowledge Challenge
          </h1>

          <p className="quiz-subtitle">
            Master the essentials of CIBIL credit scores, interest rate dynamics,
            loan eligibility calculations, and personal finance principles with 10 questions.
          </p>

          {/* 5 Categories Preview Grid */}
          <div className="quiz-categories-preview">
            {QUIZ_CATEGORIES.map((cat, i) => {
              const colors = getCategoryBadgeColor(cat);
              return (
                <div
                  key={cat}
                  className="quiz-category-chip"
                  style={{
                    background: colors.bg,
                    borderColor: colors.border,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 750, color: colors.color, letterSpacing: 0.5 }}>
                    STAGE {i + 1}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 650, marginTop: 4, color: "var(--navy)" }}>
                    {cat}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
                    2 Questions
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Rules Bar */}
          <div className="quiz-rules-bar">
            <span>⏱️ <strong>10 Questions Total</strong></span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>🎲 <strong>2 Random per category</strong></span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>💡 <strong>Explanations &amp; Review</strong></span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
              style={{
                padding: "13px 24px",
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={startQuiz}
              style={{
                padding: "13px 34px",
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
                background: "var(--primary)",
                color: "#FFF",
                boxShadow: "0 6px 18px rgba(43, 58, 46, 0.22)",
              }}
            >
              Start Challenge →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: ACTIVE QUESTION STEPPER
      ========================================================================== */}
      {stage === "active" && currentQuestion && (
        <div className="quiz-glass-card">
          {/* Header & Progress */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 6,
                  ...getCategoryBadgeColor(currentQuestion.category),
                  border: `1px solid ${getCategoryBadgeColor(currentQuestion.category).border}`,
                }}
              >
                {currentQuestion.category}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "var(--background)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {currentQuestion.difficulty}
              </span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>
              Question {currentIndex + 1} <span style={{ color: "var(--muted)", fontWeight: 500 }}>/ {questions.length}</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="quiz-progress-track">
            <div
              className="quiz-progress-fill"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <h2 className="quiz-question-heading">
            {currentQuestion.question}
          </h2>

          {/* 4 Options */}
          <div className="quiz-options-list" role="radiogroup" aria-label="Question options">
            {currentQuestion.options.map((optionText, optionIdx) => {
              const isSelected = answers[currentQuestion.id] === optionIdx;
              const optionLetter = String.fromCharCode(65 + optionIdx); // A, B, C, D

              return (
                <button
                  key={optionIdx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`quiz-option-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => handleSelectOption(currentQuestion.id, optionIdx)}
                >
                  <span className="quiz-option-letter">
                    {optionLetter}
                  </span>
                  <span className="quiz-option-text">
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--border)",
              paddingTop: 20,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                opacity: currentIndex === 0 ? 0.35 : 1,
              }}
            >
              ← Previous
            </button>

            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 550 }}>
              {answeredCount} of {questions.length} answered
            </span>

            {currentIndex === questions.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinishQuiz}
                disabled={answers[currentQuestion.id] === undefined}
                style={{
                  padding: "10px 26px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  background: "var(--success)",
                  color: "#FFF",
                  cursor: answers[currentQuestion.id] === undefined ? "not-allowed" : "pointer",
                  opacity: answers[currentQuestion.id] === undefined ? 0.45 : 1,
                }}
              >
                Submit Challenge ✓
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={answers[currentQuestion.id] === undefined}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  background: "var(--primary)",
                  color: "#FFF",
                  cursor: answers[currentQuestion.id] === undefined ? "not-allowed" : "pointer",
                  opacity: answers[currentQuestion.id] === undefined ? 0.45 : 1,
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: COMPLETED RESULTS SCREEN
      ========================================================================== */}
      {stage === "completed" && (
        <div className="quiz-glass-card">
          {/* Header Banner with Animated Circular Gauge */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="quiz-score-circle-wrapper">
              <svg className="quiz-score-circle-svg" viewBox="0 0 120 120">
                <circle
                  className="quiz-score-circle-bg"
                  cx="60"
                  cy="60"
                  r={circleRadius}
                />
                <circle
                  className="quiz-score-circle-progress"
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  stroke={scoreStrokeColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="quiz-score-center-text">
                <span className="quiz-score-percent">{summary.scorePercentage}%</span>
                <span className="quiz-score-count">
                  {summary.correctCount}/{summary.totalQuestions}
                </span>
              </div>
            </div>

            <h1 className="quiz-title" style={{ margin: "0 0 8px" }}>
              {summary.gradeTitle}
            </h1>
            <p className="quiz-subtitle" style={{ margin: "0 auto", maxWidth: 520 }}>
              {summary.feedback}
            </p>
          </div>

          {/* Category Performance Breakdown */}
          <div
            style={{
              background: "var(--background)",
              borderRadius: 14,
              padding: "24px 22px",
              marginBottom: 32,
              border: "1px solid var(--border)",
            }}
          >
            <h3 style={{ fontSize: 16, color: "var(--navy)", margin: "0 0 18px", fontWeight: 700 }}>
              📊 Category-Wise Mastery
            </h3>

            <div style={{ display: "grid", gap: 14 }}>
              {summary.categoryBreakdown.map((item) => (
                <div key={item.category} className="quiz-cat-item">
                  <div className="quiz-cat-header">
                    <span>{item.category}</span>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>
                      {item.correct}/{item.total} correct ({item.percentage}%)
                    </span>
                  </div>

                  <div className="quiz-cat-track">
                    <div
                      className="quiz-cat-fill"
                      style={{
                        width: `${item.percentage}%`,
                        background:
                          item.percentage === 100
                            ? "#3F6B4E"
                            : item.percentage >= 50
                            ? "#D97757"
                            : "#B54834",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setReviewFilter("all");
                setStage("review");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{
                padding: "12px 22px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📖 Review Answers ({questions.length})
            </button>

            {summary.incorrectQuestions.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setReviewFilter("incorrect");
                  setStage("review");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{
                  padding: "12px 22px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--danger)",
                  borderColor: "rgba(181, 72, 52, 0.3)",
                }}
              >
                ⚠️ Mistakes Only ({summary.incorrectQuestions.length})
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={startQuiz}
              style={{
                padding: "12px 26px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                background: "var(--primary)",
                color: "#FFF",
                cursor: "pointer",
              }}
            >
              🔄 Retry Challenge
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onStartAssessment}
              style={{
                padding: "12px 22px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                background: "var(--primary-soft)",
                color: "var(--primary)",
              }}
            >
              🚀 Check Loan Eligibility
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: REVIEW MODE
      ========================================================================== */}
      {stage === "review" && (
        <div style={{ display: "grid", gap: 18 }}>
          {/* Top Filter Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "16px 20px",
            }}
          >
            <div>
              <h2 style={{ fontSize: 19, color: "var(--navy)", margin: 0 }}>
                Answer Review &amp; Explanations
              </h2>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
                Your Score: {summary.correctCount} / {summary.totalQuestions} ({summary.scorePercentage}%)
              </span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setReviewFilter("all")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 650,
                  border: reviewFilter === "all" ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                  background: reviewFilter === "all" ? "var(--primary-soft)" : "transparent",
                  color: reviewFilter === "all" ? "var(--primary)" : "var(--navy)",
                  cursor: "pointer",
                }}
              >
                All ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("incorrect")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 650,
                  border: reviewFilter === "incorrect" ? "1.5px solid var(--danger)" : "1px solid var(--border)",
                  background: reviewFilter === "incorrect" ? "rgba(181, 72, 52, 0.12)" : "transparent",
                  color: reviewFilter === "incorrect" ? "var(--danger)" : "var(--navy)",
                  cursor: "pointer",
                }}
              >
                Mistakes Only ({summary.incorrectQuestions.length})
              </button>
            </div>
          </div>

          {/* Question List in Review */}
          {questions
            .filter((q) => {
              if (reviewFilter === "incorrect") {
                return answers[q.id] !== q.correctOptionIndex;
              }
              return true;
            })
            .map((q, idx) => {
              const userChoice = answers[q.id];
              const isCorrect = userChoice === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className={`quiz-review-item ${!isCorrect ? "is-incorrect-card" : ""}`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        ...getCategoryBadgeColor(q.category),
                      }}
                    >
                      {q.category}
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isCorrect ? "var(--success)" : "var(--danger)",
                      }}
                    >
                      {isCorrect ? "✓ Correct" : "✕ Incorrect"}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 16.5,
                      color: "var(--navy)",
                      margin: "0 0 16px",
                      lineHeight: 1.4,
                      fontWeight: 600,
                    }}
                  >
                    {idx + 1}. {q.question}
                  </h3>

                  {/* Options List */}
                  <div style={{ display: "grid", gap: 8 }}>
                    {q.options.map((opt, optIdx) => {
                      const isUserSelected = userChoice === optIdx;
                      const isTheCorrectOption = optIdx === q.correctOptionIndex;

                      let optBg = "var(--background)";
                      let optBorder = "var(--border)";
                      let optColor = "var(--navy)";

                      if (isTheCorrectOption) {
                        optBg = "rgba(63, 107, 78, 0.12)";
                        optBorder = "var(--success)";
                        optColor = "var(--success)";
                      } else if (isUserSelected && !isCorrect) {
                        optBg = "rgba(181, 72, 52, 0.12)";
                        optBorder = "var(--danger)";
                        optColor = "var(--danger)";
                      }

                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: optBg,
                            border: `1px solid ${optBorder}`,
                            color: optColor,
                            fontSize: 14,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>
                            <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                          </span>
                          {isTheCorrectOption && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--success)" }}>
                              Correct Answer ✓
                            </span>
                          )}
                          {isUserSelected && !isCorrect && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--danger)" }}>
                              Your Choice ✕
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="quiz-takeaway-box">
                    <strong>💡 Key Takeaway: </strong> {q.explanation}
                  </div>
                </div>
              );
            })}

          {/* Bottom Review Actions */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStage("completed");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Back to Results
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={startQuiz}
              style={{
                padding: "12px 28px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                background: "var(--primary)",
                color: "#FFF",
                cursor: "pointer",
              }}
            >
              🔄 Retry Challenge
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
