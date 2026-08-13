import { useState } from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import { z } from "zod";

import type {
  LoanApplication,
} from "../types/loan";


/* ============================================================
   VALIDATION
============================================================ */

const loanSchema = z.object({
  dependents: z
    .number()
    .int()
    .min(
      0,
      "Dependents cannot be negative"
    )
    .max(
      3,
      "Maximum 3 dependents"
    ),

  employment_type: z.enum([
    "Private",
    "Government",
    "Self-Employed",
    "Unemployed",
    "Skilled Labor",
  ]),

  annual_income: z
    .number()
    .positive(
      "Annual income must be greater than 0"
    ),

  credit_score: z
    .number()
    .min(
      300,
      "Credit score must be at least 300"
    )
    .max(
      900,
      "Credit score cannot exceed 900"
    ),

  loan_amount: z
    .number()
    .positive(
      "Loan amount must be greater than 0"
    ),

  loan_tenure: z
    .number()
    .int()
    .min(
      2,
      "Loan tenure must be at least 2 years"
    )
    .max(
      30,
      "Loan tenure cannot exceed 30 years"
    ),

  education: z.enum([
    "Graduate",
    "Post Graduate",
    "PhD",
    "High School",
    "Diploma",
    "No Formal",
  ]),
});

type LoanFormData =
  z.infer<typeof loanSchema>;


/* ============================================================
   TYPES
============================================================ */

interface LoanFormProps {
  onSubmit: (
    data: LoanApplication
  ) => void;

  loading: boolean;
}

type Step = {
  field: keyof LoanFormData;
  question: string;
  description: string;
  help: string;
};


/* ============================================================
   STEPS
============================================================ */

const steps: Step[] = [
  {
    field: "dependents",
    question:
      "How many people depend on your income?",
    description:
      "Include family members or others who rely on your regular income.",
    help:
      "Dependents are people whose living expenses are primarily supported by your income. A higher number can mean more household financial responsibility.",
  },

  {
    field: "employment_type",
    question:
      "What is your employment type?",
    description:
      "Choose the option that best describes your current source of income.",
    help:
      "Your employment status helps describe the stability and nature of your primary income source.",
  },

  {
    field: "annual_income",
    question:
      "What is your annual income?",
    description:
      "Enter your total yearly income before taxes.",
    help:
      "Annual income means the amount you earn in a typical year before taxes and deductions.",
  },

  {
    field: "credit_score",
    question:
      "What is your CIBIL / credit score?",
    description:
      "Enter your latest credit score between 300 and 900.",
    help:
      "A CIBIL score is a three-digit number representing your credit history and repayment behaviour. Scores range from 300 to 900.",
  },

  {
    field: "loan_amount",
    question:
      "How much loan do you need?",
    description:
      "Enter the amount you are planning to borrow.",
    help:
      "This is the total loan amount you want to request from the lender.",
  },

  {
    field: "loan_tenure",
    question:
      "How long would you like to repay the loan?",
    description:
      "Choose your preferred repayment period in years.",
    help:
      "Loan tenure is the length of time over which you plan to repay the borrowed amount.",
  },

  {
    field: "education",
    question:
      "What is your highest level of education?",
    description:
      "Select the highest qualification you have completed.",
    help:
      "Select the qualification that best represents your highest completed level of education.",
  },
];


/* ============================================================
   COMPONENT
============================================================ */

export default function LoanForm({
  onSubmit,
  loading,
}: LoanFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: {
      errors,
    },
  } = useForm<LoanFormData>({
    resolver:
      zodResolver(loanSchema),

    mode: "onTouched",

    defaultValues: {
      dependents: 0,
      employment_type: "Private",
      annual_income: undefined,
      credit_score: 600,
      loan_amount: undefined,
      loan_tenure: 10,
      education: "Graduate",
    },
  });

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

  const [
    helpOpen,
    setHelpOpen,
  ] = useState(false);

  const [
    creditScore,
    setCreditScore,
  ] = useState(600);

  const [
    loanTenure,
    setLoanTenure,
  ] = useState(10);

  const [
    dependents,
    setDependents,
  ] = useState(0);

  const step =
    steps[currentStep];

  const progress =
    ((currentStep + 1) /
      steps.length) *
    100;

  const isLastStep =
    currentStep ===
    steps.length - 1;


  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const goNext = async () => {
    const valid =
      await trigger(step.field);

    if (!valid) {
      return;
    }

    if (isLastStep) {
      await handleSubmit(
        (data) => {
          onSubmit(
            data as LoanApplication
          );
        }
      )();
      return;
    }

    setHelpOpen(false);

    setCurrentStep(
      (value) => value + 1
    );
  };


  const goBack = () => {
    if (currentStep === 0) {
      return;
    }

    setHelpOpen(false);

    setCurrentStep(
      (value) => value - 1
    );
  };


  /* ==========================================================
     VALUE HELPERS
  ========================================================== */

  const getError =
    errors[step.field];

  




  /* ==========================================================
     DEPENDENTS
  ========================================================== */

  const selectDependent = (
    value: number
  ) => {
    setDependents(value);

    setValue(
      "dependents",
      value,
      {
        shouldValidate: true,
        shouldTouch: true,
      }
    );
  };


  /* ==========================================================
     EMPLOYMENT
  ========================================================== */

  const employmentOptions = [
    {
      value: "Private" as const,
      label: "Private",
      icon: "💼",
    },
    {
      value: "Government" as const,
      label: "Government",
      icon: "🏛️",
    },
    {
      value: "Self-Employed" as const,
      label: "Self-Employed",
      icon: "👤",
    },
    {
      value: "Unemployed" as const,
      label: "Unemployed",
      icon: "🔎",
    },
    {
      value: "Skilled Labor" as const,
      label: "Skilled Labor",
      icon: "🛠️",
    },
  ];


  /* ==========================================================
     EDUCATION
  ========================================================== */

  const educationOptions = [
    {
      value: "Graduate" as const,
      label: "Graduate",
    },
    {
      value: "Post Graduate" as const,
      label: "Post Graduate",
    },
    {
      value: "PhD" as const,
      label: "PhD",
    },
    {
      value: "High School" as const,
      label: "High School",
    },
    {
      value: "Diploma" as const,
      label: "Diploma",
    },
    {
      value: "No Formal" as const,
      label: "No Formal",
    },
  ];


  return (
    <form
      className="assessment-form"
      onSubmit={(event) =>
        event.preventDefault()
      }
    >
      {/* ======================================================
          PROGRESS
      ======================================================= */}

      <div className="progress-area">
        <div className="progress-top">
          <span>
            Question{" "}
            <strong>
              {currentStep + 1}
            </strong>{" "}
            of {steps.length}
          </span>

          <span>
            {Math.round(progress)}%
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>


      {/* ======================================================
          QUESTION
      ======================================================= */}

      <div
        className="question-container"
        key={step.field}
      >
        <div className="question-number">
          {String(
            currentStep + 1
          ).padStart(2, "0")}
        </div>

        <div className="question-heading-row">
          <h3>
            {step.question}
          </h3>

          <button
            type="button"
            className="help-button"
            aria-label="Show information"
            onClick={() =>
              setHelpOpen(
                (value) => !value
              )
            }
          >
            ?
          </button>
        </div>

        <p className="question-description">
          {step.description}
        </p>

        {helpOpen && (
          <div className="help-card">
            <div className="help-card-icon">
              i
            </div>

            <div>
              <strong>
                Good to know
              </strong>

              <p>
                {step.help}
              </p>
            </div>

            <button
              type="button"
              className="help-close"
              onClick={() =>
                setHelpOpen(false)
              }
            >
              ×
            </button>
          </div>
        )}


        {/* ====================================================
            DEPENDENTS
        ===================================================== */}

        {step.field ===
          "dependents" && (
          <div className="number-options">
            {[0, 1, 2, 3].map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  className={`number-option ${
                    dependents === value
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    selectDependent(
                      value
                    )
                  }
                >
                  <span>
                    {value}
                  </span>

                  <small>
                    {value === 0
                      ? "None"
                      : value === 1
                        ? "Person"
                        : "People"}
                  </small>
                </button>
              )
            )}
          </div>
        )}


        {/* ====================================================
            EMPLOYMENT
        ===================================================== */}

        {step.field ===
          "employment_type" && (
          <div className="option-grid">
            {employmentOptions.map(
              (option) => {
                const selected =
                  getValues(
                    "employment_type"
                  ) ===
                  option.value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    className={`choice-card ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setValue(
                        "employment_type",
                        option.value,
                        {
                          shouldValidate:
                            true,
                          shouldTouch:
                            true,
                        }
                      )
                    }
                  >
                    <span className="choice-icon">
                      {option.icon}
                    </span>

                    <span>
                      {
                        option.label
                      }
                    </span>

                    {selected && (
                      <span className="choice-check">
                        ✓
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        )}


        {/* ====================================================
            ANNUAL INCOME
        ===================================================== */}

        {step.field ===
          "annual_income" && (
          <div className="input-area">
            <div className="currency-input">
              <span>₹</span>

              <input
                type="number"
                inputMode="numeric"
                placeholder="60,00,000"
                {...register(
                  "annual_income",
                  {
                    valueAsNumber:
                      true,
                  }
                )}
              />
            </div>

            <p className="input-hint">
              Example: ₹6,00,000
            </p>
          </div>
        )}


        {/* ====================================================
            CREDIT SCORE
        ===================================================== */}

        {step.field ===
          "credit_score" && (
          <div className="slider-area">
            <div className="score-display">
              <span>
                CIBIL Score
              </span>

              <strong>
                {creditScore}
              </strong>
            </div>

            <input
              type="range"
              min="300"
              max="900"
              step="1"
              value={creditScore}
              className="custom-range"
              style={{
                background: `linear-gradient(to right, #2374f7 ${
                  ((creditScore - 300) /
                    600) *
                  100
                }%, #e8eef8 ${
                  ((creditScore - 300) /
                    600) *
                  100
                }%)`,
              }}
              {...register(
                "credit_score",
                {
                  valueAsNumber:
                    true,
                  onChange: (
                    event
                  ) => {
                    setCreditScore(
                      Number(
                        event.target
                          .value
                      )
                    );
                  },
                }
              )}
            />

            <div className="range-labels">
              <span>300</span>
              <span>600</span>
              <span>900</span>
            </div>

            <div className="score-status">
              {creditScore >=
              750
                ? "Excellent"
                : creditScore >=
                    700
                  ? "Good"
                  : creditScore >=
                      600
                    ? "Fair"
                    : "Needs improvement"}
            </div>
          </div>
        )}


        {/* ====================================================
            LOAN AMOUNT
        ===================================================== */}

        {step.field ===
          "loan_amount" && (
          <div className="input-area">
            <div className="currency-input">
              <span>₹</span>

              <input
                type="number"
                inputMode="numeric"
                placeholder="15,00,000"
                {...register(
                  "loan_amount",
                  {
                    valueAsNumber:
                      true,
                  }
                )}
              />
            </div>

            <p className="input-hint">
              Enter the total amount you
              want to borrow.
            </p>
          </div>
        )}


        {/* ====================================================
            LOAN TENURE
        ===================================================== */}

        {step.field ===
          "loan_tenure" && (
          <div className="slider-area">
            <div className="score-display">
              <span>
                Repayment period
              </span>

              <strong>
                {loanTenure}{" "}
                <small>
                  years
                </small>
              </strong>
            </div>

            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={loanTenure}
              className="custom-range"
              style={{
                background: `linear-gradient(to right, #2374f7 ${
                  ((loanTenure - 2) /
                    28) *
                  100
                }%, #e8eef8 ${
                  ((loanTenure - 2) /
                    28) *
                  100
                }%)`,
              }}
              {...register(
                "loan_tenure",
                {
                  valueAsNumber:
                    true,
                  onChange: (
                    event
                  ) => {
                    setLoanTenure(
                      Number(
                        event.target
                          .value
                      )
                    );
                  },
                }
              )}
            />

            <div className="range-labels">
              <span>2 years</span>
              <span>15 years</span>
              <span>30 years</span>
            </div>
          </div>
        )}


        {/* ====================================================
            EDUCATION
        ===================================================== */}

        {step.field ===
          "education" && (
          <div className="education-grid">
            {educationOptions.map(
              (option) => {
                const selected =
                  getValues(
                    "education"
                  ) ===
                  option.value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    className={`education-card ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setValue(
                        "education",
                        option.value,
                        {
                          shouldValidate:
                            true,
                          shouldTouch:
                            true,
                        }
                      )
                    }
                  >
                    <span>
                      {
                        option.label
                      }
                    </span>

                    {selected && (
                      <span className="education-check">
                        ✓
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        )}


        {/* ====================================================
            ERROR
        ===================================================== */}

        {getError && (
          <div className="field-error">
            <span>!</span>

            <span>
              {getError.message}
            </span>
          </div>
        )}
      </div>


      {/* ======================================================
          NAVIGATION
      ======================================================= */}

      <div className="form-navigation">
        <button
          type="button"
          className="back-button"
          onClick={goBack}
          disabled={
            currentStep === 0 ||
            loading
          }
        >
          ←
          <span>Back</span>
        </button>

        <button
          type="button"
          className="continue-button"
          onClick={goNext}
          disabled={loading}
        >
          {loading
            ? "Analyzing..."
            : isLastStep
              ? "Predict My Eligibility"
              : "Continue"}

          {!loading && (
            <span>
              →
            </span>
          )}
        </button>
      </div>


      {/* ======================================================
          FOOT NOTE
      ======================================================= */}

      <div className="assessment-note">
        <span>🔒</span>

        <span>
          Your answers are processed securely
          for this assessment.
        </span>
      </div>
    </form>
  );
}