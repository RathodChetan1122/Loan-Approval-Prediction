import { useState } from "react";
import {
  useForm,
  useWatch,
  Controller,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";
import { z } from "zod";

import type {
  NTCApplication,
} from "../types/loan";


const ntcSchema = z.object({
  dependents: z.number()
    .int()
    .min(0, "Dependents cannot be negative")
    .max(3, "Maximum 3 dependents"),

  employment_type: z.enum([
    "Private",
    "Government",
    "Self-Employed",
    "Unemployed",
    "Skilled Labor",
  ]),

  annual_income: z.number()
    .positive("Annual income must be greater than ₹0"),

  monthly_expenses: z.number()
    .min(0, "Monthly expenses cannot be negative"),

  loan_amount: z.number()
    .positive("Loan amount must be greater than ₹0"),

  loan_tenure: z.number()
    .int()
    .min(2, "Loan tenure must be between 2 and 30 years")
    .max(30, "Loan tenure must be between 2 and 30 years"),

  education: z.enum([
    "Graduate",
    "Post Graduate",
    "PhD",
    "High School",
    "Diploma",
    "No Formal",
  ]),
});


type NTCFormData = z.infer<typeof ntcSchema>;


type Step = {
  field: keyof NTCFormData;
  eyebrow: string;
  icon: string;
  question: string;
  description: string;
  helpTitle: string;
  help: string;
};


const steps: Step[] = [
  {
    field: "dependents",
    eyebrow: "HOUSEHOLD DETAILS",
    icon: "⌂",
    question: "How many people depend on your income?",
    description:
      "This includes family members or others who financially rely on you.",
    helpTitle: "What are dependents?",
    help:
      "Dependents are people whose regular living expenses are supported by your income.",
  },

  {
    field: "employment_type",
    eyebrow: "INCOME PROFILE",
    icon: "▣",
    question: "What is your employment type?",
    description:
      "Choose the option that best describes your current source of income.",
    helpTitle: "Why we ask",
    help:
      "Employment information helps the model understand the stability and nature of your primary income source.",
  },

  {
    field: "annual_income",
    eyebrow: "INCOME PROFILE",
    icon: "₹",
    question: "What is your annual income?",
    description:
      "Enter your total yearly income before taxes and deductions.",
    helpTitle: "Annual income",
    help:
      "Include your typical income from all regular sources before tax deductions.",
  },

  {
    field: "monthly_expenses",
    eyebrow: "INCOME PROFILE",
    icon: "₹",
    question: "What are your monthly expenses?",
    description:
      "Enter your approximate total monthly spending on regular expenses.",
    helpTitle: "Monthly expenses",
    help:
      "Enter your approximate total monthly spending on regular expenses such as rent, food, utilities, transportation, and other recurring household expenses.",
  },

  {
    field: "loan_amount",
    eyebrow: "LOAN DETAILS",
    icon: "₹",
    question: "How much loan do you need?",
    description:
      "Enter the requested principal amount you plan to borrow.",
    helpTitle: "Requested principal",
    help:
      "This is the total loan amount you would like to request from the lender.",
  },

  {
    field: "loan_tenure",
    eyebrow: "LOAN DETAILS",
    icon: "◷",
    question: "How long would you like to repay the loan?",
    description:
      "Choose a repayment period that suits your financial plan.",
    helpTitle: "Loan tenure",
    help:
      "Loan tenure is the length of time over which you plan to repay the borrowed amount.",
  },

  {
    field: "education",
    eyebrow: "PROFILE DETAILS",
    icon: "▤",
    question: "What is your highest level of education?",
    description:
      "Select the highest qualification you have completed.",
    helpTitle: "Education details",
    help:
      "Select the qualification that best represents your highest completed education.",
  },
];


const employment = [
  ["Private", "▣", "Private sector"],
  ["Government", "▥", "Government sector"],
  ["Self-Employed", "◉", "Business / freelance"],
  ["Unemployed", "⌕", "Currently seeking work"],
  ["Skilled Labor", "⚒", "Skilled occupation"],
] as const;


const education = [
  ["Graduate", "▤"],
  ["Post Graduate", "▦"],
  ["PhD", "✦"],
  ["High School", "▧"],
  ["Diploma", "◇"],
  ["No Formal", "○"],
] as const;


interface Props {
  onSubmit: (data: NTCApplication) => void;
  loading: boolean;
  onBack?: () => void;
}


export default function NTCForm({
  onSubmit,
  loading,
  onBack,
}: Props) {

  const {
    control,
    register,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<NTCFormData>({
    resolver: zodResolver(ntcSchema),
    mode: "onTouched",

    defaultValues: {
      dependents: 0,
      employment_type: "Private",
      annual_income: undefined,
      monthly_expenses: undefined,
      loan_amount: undefined,
      loan_tenure: 5,
      education: "Graduate",
    },
  });


  const [currentStep, setCurrentStep] =
    useState(0);

  const [helpOpen, setHelpOpen] =
    useState(false);


  const values = useWatch({
    control,
  });


  const step = steps[currentStep];


  const progress = Math.round(
    ((currentStep + 1) / steps.length) * 100
  );


  const tenure =
    values.loan_tenure ?? 5;


  const moveNext = async () => {

    if (!(await trigger(step.field))) {
      return;
    }


    if (
      currentStep ===
      steps.length - 1
    ) {
      await handleSubmit(
        (data) => onSubmit(data)
      )();

      return;
    }


    setHelpOpen(false);

    setCurrentStep(
      (value) => value + 1
    );
  };


  const pickDependents = (
    value: number
  ) => {
    setValue(
      "dependents",
      value,
      {
        shouldTouch: true,
        shouldValidate: true,
      }
    );
  };


  const pickEmployment = (
    value: NTCApplication["employment_type"]
  ) => {
    setValue(
      "employment_type",
      value,
      {
        shouldTouch: true,
        shouldValidate: true,
      }
    );
  };


  const pickEducation = (
    value: NTCApplication["education"]
  ) => {
    setValue(
      "education",
      value,
      {
        shouldTouch: true,
        shouldValidate: true,
      }
    );
  };


  const error =
    errors[step.field]?.message;


  return (
    <div className="assessment-wrapper">
      <div className="assessment-card">
        <header className="assessment-header">
          <div>
            <span className="assessment-eyebrow">NEW-TO-CREDIT ASSESSMENT</span>
            <h2>Alternative Credit Assessment</h2>
          </div>
          <span className="assessment-icon" aria-hidden="true">✦</span>
        </header>

        <form
          className="assessment-form"
          onSubmit={(event) =>
            event.preventDefault()
          }
        >

      <div className="progress-area">

        <div className="progress-top">
          <span>
            Question{" "}
            <strong>
              {currentStep + 1}
            </strong>{" "}
            of 7
          </span>

          <span>
            {progress}%
          </span>
        </div>


        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={
            currentStep + 1
          }
          aria-valuemin={1}
          aria-valuemax={7}
        >
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

      </div>


      <section
        className="question-container"
        key={step.field}
        aria-live="polite"
      >

        <div className="question-meta">

          <span className="question-number">
            {String(
              currentStep + 1
            ).padStart(2, "0")}
          </span>

          <span className="question-eyebrow">
            {step.eyebrow}
          </span>

          <span
            className="question-icon"
            aria-hidden="true"
          >
            {step.icon}
          </span>

        </div>


        <div className="question-heading-row">

          <h3>
            {step.question}
          </h3>

          <button
            type="button"
            className="help-button"
            aria-label="Show information"
            aria-expanded={helpOpen}
            onClick={() =>
              setHelpOpen(
                (open) => !open
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
          <aside className="help-card">

            <span className="help-card-icon">
              i
            </span>

            <div>
              <strong>
                {step.helpTitle}
              </strong>

              <p>
                {step.help}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close information"
              className="help-close"
              onClick={() =>
                setHelpOpen(false)
              }
            >
              ×
            </button>

          </aside>
        )}


        {step.field ===
          "dependents" && (

          <div className="number-options">

            {[0, 1, 2, 3].map(
              (value) => (

                <button
                  key={value}
                  type="button"
                  className={
                    `number-option ${
                      values.dependents === value
                        ? "selected"
                        : ""
                    }`
                  }
                  aria-pressed={
                    values.dependents === value
                  }
                  onClick={() =>
                    pickDependents(
                      value
                    )
                  }
                >
                  <b>
                    {value}
                  </b>

                  <small>
                    {value === 0
                      ? "None"
                      : value === 1
                      ? "Person"
                      : "People"}
                  </small>

                  {values.dependents ===
                    value && (
                    <i>✓</i>
                  )}
                </button>

              )
            )}

          </div>
        )}


        {step.field ===
          "employment_type" && (

          <div className="option-grid">

            {employment.map(
              ([
                value,
                icon,
                detail,
              ]) => (

                <button
                  key={value}
                  type="button"
                  className={
                    `choice-card ${
                      values.employment_type ===
                      value
                        ? "selected"
                        : ""
                    }`
                  }
                  aria-pressed={
                    values.employment_type ===
                    value
                  }
                  onClick={() =>
                    pickEmployment(
                      value
                    )
                  }
                >

                  <span className="choice-icon">
                    {icon}
                  </span>

                  <span>
                    <b>
                      {value}
                    </b>

                    <small>
                      {detail}
                    </small>
                  </span>

                  {values.employment_type ===
                    value && (
                    <i className="choice-check">
                      ✓
                    </i>
                  )}

                </button>

              )
            )}

          </div>
        )}


        {step.field ===
          "annual_income" && (

          <CurrencyInput
            label="Annual income"
            placeholder="6,00,000"
            name="annual_income"
            control={control}
            hint="Example: ₹6,00,000 per year"
          />
        )}

        {step.field ===
          "monthly_expenses" && (

          <CurrencyInput
            label="Monthly expenses"
            placeholder="25,000"
            name="monthly_expenses"
            control={control}
            hint="Example: ₹25,000 per month"
          />
        )}


        {step.field ===
          "loan_amount" && (

          <CurrencyInput
            label="Loan amount"
            placeholder="15,00,000"
            name="loan_amount"
            control={control}
            hint="Requested principal amount"
          />
        )}


        {step.field ===
          "loan_tenure" && (

          <div className="slider-area">

            <div className="score-display">
              <span>
                Repayment period
              </span>

              <strong>
                {tenure}{" "}
                <small>
                  years
                </small>
              </strong>
            </div>

            <input
              aria-label="Loan tenure in years"
              type="range"
              min="2"
              max="30"
              step="1"
              className="custom-range"
              style={{
                "--range-progress":
                  `${(
                    (tenure - 2) /
                    28
                  ) * 100}%`,
              } as React.CSSProperties}
              {...register(
                "loan_tenure",
                {
                  valueAsNumber: true,
                }
              )}
            />

            <div className="range-labels">
              <span>
                2 years
              </span>

              <span>
                16 years
              </span>

              <span>
                30 years
              </span>
            </div>

            <p className="slider-hint">
              Choose a comfortable repayment period.
            </p>

          </div>
        )}


        {step.field ===
          "education" && (

          <div className="education-grid">

            {education.map(
              ([
                value,
                icon,
              ]) => (

                <button
                  key={value}
                  type="button"
                  className={
                    `education-card ${
                      values.education ===
                      value
                        ? "selected"
                        : ""
                    }`
                  }
                  aria-pressed={
                    values.education ===
                    value
                  }
                  onClick={() =>
                    pickEducation(
                      value
                    )
                  }
                >

                  <span>
                    {icon}
                  </span>

                  <b>
                    {value}
                  </b>

                  {values.education ===
                    value && (
                    <i className="education-check">
                      ✓
                    </i>
                  )}

                </button>

              )
            )}

          </div>
        )}


        {error && (
          <p
            className="field-error"
            role="alert"
          >
            <span>!</span>
            {error}
          </p>
        )}

      </section>


      <nav
        className="form-navigation"
        aria-label="Assessment navigation"
      >

        <button
          type="button"
          className="back-button"
          disabled={
            (!onBack && currentStep === 0) ||
            loading
          }
          onClick={() => {
            if (currentStep === 0 && onBack) {
              onBack();
              return;
            }
            setHelpOpen(false);

            setCurrentStep(
              (value) =>
                Math.max(
                  0,
                  value - 1
                )
            );
          }}
        >
          ← <span>Back</span>
        </button>


        <button
          type="button"
          className="continue-button"
          disabled={loading}
          onClick={moveNext}
        >
          {loading
            ? "Analyzing..."
            : currentStep === 6
            ? "Check eligibility"
            : (
              <>
                Continue{" "}
                <span>→</span>
              </>
            )}
        </button>

      </nav>


      <p className="assessment-note">
        ⌑ Your answers are processed securely for this assessment.
      </p>

        </form>
      </div>
    </div>
  );
}


import { NumericFormat } from "react-number-format";

function CurrencyInput({
  label,
  placeholder,
  name,
  control,
  hint,
}: {
  label: string;
  placeholder: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  hint: string;
}) {
  return (
    <div className="input-area">
      <label
        className="sr-only"
        htmlFor={label}
      >
        {label}
      </label>

      <div className="currency-input">
        <span>₹</span>
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <NumericFormat
              id={label}
              getInputRef={ref}
              placeholder={placeholder}
              thousandSeparator=","
              thousandsGroupStyle="lakh"
              allowNegative={false}
              isAllowed={({ value }) => value.length <= 8}
              value={value}
              onBlur={onBlur}
              onValueChange={(values) => {
                onChange(values.floatValue);
              }}
            />
          )}
        />
      </div>

      <p className="input-hint">
        {hint}
      </p>
    </div>
  );
}
