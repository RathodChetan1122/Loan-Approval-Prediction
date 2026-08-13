import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LoanApplication } from "../types/loan";

const loanSchema = z.object({
  dependents: z.number().int().min(0, "Dependents cannot be negative").max(3, "Maximum 3 dependents"),
  employment_type: z.enum(["Private", "Government", "Self-Employed", "Unemployed", "Skilled Labor"]),
  annual_income: z.number().positive("Annual income must be greater than ₹0"),
  credit_score: z.number().min(300, "Credit score must be between 300 and 900").max(900, "Credit score must be between 300 and 900"),
  loan_amount: z.number().positive("Loan amount must be greater than ₹0"),
  loan_tenure: z.number().int().min(2, "Loan tenure must be between 2 and 30 years").max(30, "Loan tenure must be between 2 and 30 years"),
  education: z.enum(["Graduate", "Post Graduate", "PhD", "High School", "Diploma", "No Formal"]),
});
type LoanFormData = z.infer<typeof loanSchema>;
type Step = { field: keyof LoanFormData; eyebrow: string; icon: string; question: string; description: string; helpTitle: string; help: string };
const steps: Step[] = [
  { field: "dependents", eyebrow: "HOUSEHOLD DETAILS", icon: "⌂", question: "How many people depend on your income?", description: "This includes family members or others who financially rely on you.", helpTitle: "What are dependents?", help: "Dependents are people whose regular living expenses are supported by your income, such as children or family members." },
  { field: "employment_type", eyebrow: "INCOME PROFILE", icon: "▣", question: "What is your employment type?", description: "Choose the option that best describes your current source of income.", helpTitle: "Why we ask", help: "Employment information helps the model understand the stability and nature of your primary income source." },
  { field: "annual_income", eyebrow: "INCOME PROFILE", icon: "₹", question: "What is your annual income?", description: "Enter your total yearly income before taxes and deductions.", helpTitle: "Annual income", help: "Include your typical income from all regular sources before tax deductions." },
  { field: "credit_score", eyebrow: "CREDIT HEALTH", icon: "◔", question: "What is your CIBIL / credit score?", description: "Your score helps us build a more confident eligibility estimate.", helpTitle: "About credit scores", help: "A CIBIL score is a three-digit summary of your credit history and repayment behaviour, ranging from 300 to 900." },
  { field: "loan_amount", eyebrow: "LOAN DETAILS", icon: "₹", question: "How much loan do you need?", description: "Enter the requested principal amount you plan to borrow.", helpTitle: "Requested principal", help: "This is the total loan amount you would like to request from the lender." },
  { field: "loan_tenure", eyebrow: "LOAN DETAILS", icon: "◷", question: "How long would you like to repay the loan?", description: "Choose a repayment period that suits your financial plan.", helpTitle: "Loan tenure", help: "Loan tenure is the length of time over which you plan to repay the borrowed amount." },
  { field: "education", eyebrow: "PROFILE DETAILS", icon: "▤", question: "What is your highest level of education?", description: "Select the highest qualification you have completed.", helpTitle: "Education details", help: "Select the qualification that best represents your highest completed education." },
];
const employment = [
  ["Private", "▣", "Private sector"], ["Government", "▥", "Government sector"], ["Self-Employed", "◉", "Business / freelance"], ["Unemployed", "⌕", "Currently seeking work"], ["Skilled Labor", "⚒", "Skilled occupation"],
] as const;
const education = [["Graduate", "▤"], ["Post Graduate", "▦"], ["PhD", "✦"], ["High School", "▧"], ["Diploma", "◇"], ["No Formal", "○"]] as const;

interface Props { onSubmit: (data: LoanApplication) => void; loading: boolean }
export default function LoanForm({ onSubmit, loading }: Props) {
  const { control, register, setValue, trigger, handleSubmit, formState: { errors } } = useForm<LoanFormData>({ resolver: zodResolver(loanSchema), mode: "onTouched", defaultValues: { dependents: 0, employment_type: "Private", credit_score: 600, loan_tenure: 10, education: "Graduate" } });
  const [currentStep, setCurrentStep] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const values = useWatch({ control });
  const step = steps[currentStep];
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);
  const score = values.credit_score ?? 600;
  const tenure = values.loan_tenure ?? 10;
  const status = score < 580 ? "Needs improvement" : score < 670 ? "Fair" : score < 750 ? "Good" : score < 800 ? "Very good" : "Excellent";
  const moveNext = async () => {
    if (!(await trigger(step.field))) return;
    if (currentStep === steps.length - 1) { await handleSubmit((data) => onSubmit(data))(); return; }
    setHelpOpen(false); setCurrentStep((value) => value + 1);
  };
  const pickDependents = (value: number) => setValue("dependents", value, { shouldTouch: true, shouldValidate: true });
  const pickEmployment = (value: LoanApplication["employment_type"]) => setValue("employment_type", value, { shouldTouch: true, shouldValidate: true });
  const pickEducation = (value: LoanApplication["education"]) => setValue("education", value, { shouldTouch: true, shouldValidate: true });
  const error = errors[step.field]?.message;
  return <form className="assessment-form" onSubmit={(event) => event.preventDefault()}>
    <div className="progress-area"><div className="progress-top"><span>Question <strong>{currentStep + 1}</strong> of 7</span><span>{progress}%</span></div><div className="progress-track" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={7}><div className="progress-fill" style={{ width: `${progress}%` }} /></div></div>
    <section className="question-container" key={step.field} aria-live="polite">
      <div className="question-meta"><span className="question-number">{String(currentStep + 1).padStart(2, "0")}</span><span className="question-eyebrow">{step.eyebrow}</span><span className="question-icon" aria-hidden="true">{step.icon}</span></div>
      <div className="question-heading-row"><h3>{step.question}</h3><button type="button" className="help-button" aria-label="Show information" aria-expanded={helpOpen} onClick={() => setHelpOpen((open) => !open)}>?</button></div>
      <p className="question-description">{step.description}</p>
      {helpOpen && <aside className="help-card"><span className="help-card-icon">i</span><div><strong>{step.helpTitle}</strong><p>{step.help}</p></div><button type="button" aria-label="Close information" className="help-close" onClick={() => setHelpOpen(false)}>×</button></aside>}
      {step.field === "dependents" && <div className="number-options">{[0, 1, 2, 3].map((value) => <button key={value} type="button" className={`number-option ${values.dependents === value ? "selected" : ""}`} aria-pressed={values.dependents === value} onClick={() => pickDependents(value)}><b>{value}</b><small>{value === 0 ? "None" : value === 1 ? "Person" : "People"}</small>{values.dependents === value && <i>✓</i>}</button>)}</div>}
      {step.field === "employment_type" && <div className="option-grid">{employment.map(([value, icon, detail]) => <button key={value} type="button" className={`choice-card ${values.employment_type === value ? "selected" : ""}`} aria-pressed={values.employment_type === value} onClick={() => pickEmployment(value)}><span className="choice-icon">{icon}</span><span><b>{value}</b><small>{detail}</small></span>{values.employment_type === value && <i className="choice-check">✓</i>}</button>)}</div>}
      {step.field === "annual_income" && <CurrencyInput label="Annual income" placeholder="6,00,000" registration={register("annual_income", { valueAsNumber: true })} hint="Example: ₹6,00,000 per year" />}
      {step.field === "loan_amount" && <CurrencyInput label="Loan amount" placeholder="15,00,000" registration={register("loan_amount", { valueAsNumber: true })} hint="Requested principal amount" />}
      {step.field === "credit_score" && <div className="slider-area score-slider" style={{ "--range-progress": `${((score - 300) / 600) * 100}%` } as React.CSSProperties}><div className="score-orb"><span>Your credit score</span><strong>{score}</strong><small>out of 900</small></div><div className="score-display"><span>Move the slider to your latest CIBIL score</span><strong>{status}</strong></div><input aria-label="Credit score" type="range" min="300" max="900" step="1" className="custom-range" {...register("credit_score", { valueAsNumber: true })} /><div className="range-labels"><span>300</span><span>450</span><span>600</span><span>750</span><span>900</span></div><span className="score-status">Credit health: {status}</span></div>}
      {step.field === "loan_tenure" && <div className="slider-area"><div className="score-display"><span>Repayment period</span><strong>{tenure} <small>years</small></strong></div><input aria-label="Loan tenure in years" type="range" min="2" max="30" step="1" className="custom-range" style={{ "--range-progress": `${((tenure - 2) / 28) * 100}%` } as React.CSSProperties} {...register("loan_tenure", { valueAsNumber: true })} /><div className="range-labels"><span>2 years</span><span>16 years</span><span>30 years</span></div><p className="slider-hint">Choose a comfortable repayment period.</p></div>}
      {step.field === "education" && <div className="education-grid">{education.map(([value, icon]) => <button key={value} type="button" className={`education-card ${values.education === value ? "selected" : ""}`} aria-pressed={values.education === value} onClick={() => pickEducation(value)}><span>{icon}</span><b>{value}</b>{values.education === value && <i className="education-check">✓</i>}</button>)}</div>}
      {error && <p className="field-error" role="alert"><span>!</span>{error}</p>}
    </section>
    <nav className="form-navigation" aria-label="Assessment navigation"><button type="button" className="back-button" disabled={currentStep === 0 || loading} onClick={() => { setHelpOpen(false); setCurrentStep((value) => Math.max(0, value - 1)); }}>← <span>Back</span></button><button type="button" className="continue-button" disabled={loading} onClick={moveNext}>{loading ? "Analyzing..." : currentStep === 6 ? "Check eligibility ✓" : <>Continue <span>→</span></>}</button></nav>
    <p className="assessment-note">⌑ Your answers are processed securely for this assessment.</p>
  </form>;
}

function CurrencyInput({ label, placeholder, registration, hint }: { label: string; placeholder: string; registration: UseFormRegisterReturn; hint: string }) {
  return <div className="input-area"><label className="sr-only" htmlFor={label}>{label}</label><div className="currency-input"><span>₹</span><input id={label} type="number" min="0" inputMode="numeric" placeholder={placeholder} {...registration} /></div><p className="input-hint">{hint}</p></div>;
}
