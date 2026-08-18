import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TenureUnit, EmiCalculationResult } from "../types/emi";
import { calculateEmi, formatIndianCurrency } from "../utils/emiCalculator";
import { NumericFormat } from "react-number-format";

const emiFormSchema = z.object({
  loanAmount: z
    .number({
      error: "Please enter a valid loan amount.",
    })
    .positive("Please enter a valid loan amount greater than ₹0.")
    .max(1000000000, "Loan amount is too large for standard calculation."),
  interestRate: z
    .number({
      error: "Please enter a valid interest rate.",
    })
    .min(0, "Interest rate cannot be negative.")
    .max(100, "Interest rate cannot exceed 100% per annum."),
  tenure: z
    .number({
      error: "Please enter a valid loan tenure.",
    })
    .positive("Please enter a valid loan tenure greater than 0.")
    .max(600, "Loan tenure cannot exceed 600 months (50 years)."),
  tenureUnit: z.enum(["years", "months"]),
});

type EmiFormData = z.infer<typeof emiFormSchema>;

interface EmiCalculatorProps {
  onBack: () => void;
  onStartAssessment?: () => void;
}

export default function EmiCalculator({ onBack, onStartAssessment }: EmiCalculatorProps) {
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calculationResult, setCalculationResult] = useState<EmiCalculationResult | null>(null);

  const {
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<EmiFormData>({
    resolver: zodResolver(emiFormSchema),
    mode: "onTouched",
    defaultValues: {
      loanAmount: 1000000,
      interestRate: 8.5,
      tenure: 5,
      tenureUnit: "years",
    },
  });

  const watchedValues = useWatch({ control });
  const tenureUnit = watchedValues.tenureUnit || "years";

  const executeCalculation = (data: EmiFormData) => {
    const result = calculateEmi({
      loanAmount: data.loanAmount,
      interestRate: data.interestRate,
      tenure: data.tenure,
      tenureUnit: data.tenureUnit,
    });
    setCalculationResult(result);
    setHasCalculated(true);
  };

  const handleReset = () => {
    reset({
      loanAmount: undefined,
      interestRate: undefined,
      tenure: undefined,
      tenureUnit: "years",
    });
    setCalculationResult(null);
    setHasCalculated(false);
  };

  const setUnit = (unit: TenureUnit) => {
    setValue("tenureUnit", unit, { shouldValidate: true, shouldDirty: true });
    // If we have calculated and inputs are valid, recalculate automatically
    if (watchedValues.loanAmount && watchedValues.interestRate !== undefined && watchedValues.tenure) {
      const result = calculateEmi({
        loanAmount: Number(watchedValues.loanAmount),
        interestRate: Number(watchedValues.interestRate),
        tenure: Number(watchedValues.tenure),
        tenureUnit: unit,
      });
      setCalculationResult(result);
    }
  };

  return (
    <section className="emi-calculator-view" aria-labelledby="emi-calculator-title">
      <header className="emi-view-header">
        <button
          type="button"
          className="back-nav-button"
          onClick={onBack}
          aria-label="Return to Dashboard"
        >
          ← Back to Dashboard
        </button>
        <div className="emi-intro">
          <span className="emi-eyebrow">FINANCIAL UTILITY</span>
          <h1 id="emi-calculator-title">Loan EMI Calculator</h1>
          <p>
            Estimate your approximate monthly installment and total repayment breakdown
            before applying for a loan.
          </p>
        </div>
      </header>

      <div className="emi-layout">
        {/* Input Form Column */}
        <div className="emi-card emi-form-card">
          <header className="emi-card-header">
            <div>
              <span className="card-kicker">LOAN PARAMETERS</span>
              <h2>Enter Loan Details</h2>
            </div>
            <span className="emi-card-icon" aria-hidden="true">₹</span>
          </header>

          <form
            className="emi-form"
            onSubmit={handleSubmit(executeCalculation)}
            noValidate
          >
            {/* Loan Amount */}
            <div className="emi-form-group">
              <div className="emi-label-row">
                <label htmlFor="emi-loan-amount" className="emi-label">
                  Loan Amount
                </label>
                <span className="emi-label-sub">Principal Amount</span>
              </div>
              <div className={`emi-input-wrap ${errors.loanAmount ? "has-error" : ""}`}>
                <span className="input-prefix" aria-hidden="true">₹</span>
                <Controller
                  name="loanAmount"
                  control={control}
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <NumericFormat
                      id="emi-loan-amount"
                      getInputRef={ref}
                      className="emi-input"
                      placeholder="e.g. 10,00,000"
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
              <p className="emi-field-hint">Enter the total amount you plan to borrow</p>
              {errors.loanAmount && (
                <p className="field-error" role="alert">
                  <span>!</span>
                  {errors.loanAmount.message}
                </p>
              )}
            </div>

            {/* Annual Interest Rate */}
            <div className="emi-form-group">
              <div className="emi-label-row">
                <label htmlFor="emi-interest-rate" className="emi-label">
                  Annual Interest Rate
                </label>
                <span className="emi-label-sub">Per Annum (%)</span>
              </div>
              <div className={`emi-input-wrap ${errors.interestRate ? "has-error" : ""}`}>
                <span className="input-prefix" aria-hidden="true">%</span>
                <Controller
                  name="interestRate"
                  control={control}
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <NumericFormat
                      id="emi-interest-rate"
                      getInputRef={ref}
                      className="emi-input"
                      placeholder="e.g. 8.5"
                      allowNegative={false}
                      decimalScale={2}
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
              <p className="emi-field-hint">Enter the expected annual interest rate (e.g. 8.5)</p>
              {errors.interestRate && (
                <p className="field-error" role="alert">
                  <span>!</span>
                  {errors.interestRate.message}
                </p>
              )}
            </div>

            {/* Loan Tenure */}
            <div className="emi-form-group">
              <div className="emi-label-row">
                <label htmlFor="emi-tenure" className="emi-label">
                  Loan Tenure
                </label>
                <span className="emi-label-sub">Duration</span>
              </div>
              <div className="emi-tenure-control">
                <div className={`emi-input-wrap tenure-input-wrap ${errors.tenure ? "has-error" : ""}`}>
                  <Controller
                    name="tenure"
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <NumericFormat
                        id="emi-tenure"
                        getInputRef={ref}
                        className="emi-input"
                        placeholder={tenureUnit === "years" ? "e.g. 5" : "e.g. 60"}
                        allowNegative={false}
                        decimalScale={0}
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
                <div className="tenure-unit-toggle" role="radiogroup" aria-label="Tenure Unit">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={tenureUnit === "years"}
                    className={`unit-btn ${tenureUnit === "years" ? "active" : ""}`}
                    onClick={() => setUnit("years")}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={tenureUnit === "months"}
                    className={`unit-btn ${tenureUnit === "months" ? "active" : ""}`}
                    onClick={() => setUnit("months")}
                  >
                    Months
                  </button>
                </div>
              </div>
              <p className="emi-field-hint">
                {tenureUnit === "years"
                  ? "Choose tenure in years (e.g. 5 years = 60 monthly payments)"
                  : "Choose tenure in total number of months"}
              </p>
              {errors.tenure && (
                <p className="field-error" role="alert">
                  <span>!</span>
                  {errors.tenure.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="emi-form-actions">
              <button
                type="submit"
                className="emi-submit-btn"
              >
                {hasCalculated ? "Recalculate EMI" : "Calculate EMI"}
              </button>
              <button
                type="button"
                className="emi-reset-btn"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="emi-card emi-result-card" aria-live="polite">
          <header className="emi-card-header">
            <div>
              <span className="card-kicker">ESTIMATED REPAYMENT</span>
              <h2>Calculation Breakdown</h2>
            </div>
            <span className="emi-card-icon" aria-hidden="true">✦</span>
          </header>

          {calculationResult && calculationResult.monthlyEmi > 0 ? (
            <div className="emi-result-content">
              {/* Primary Monthly EMI Hero Display */}
              <div className="emi-primary-display">
                <span className="primary-label">Estimated Monthly EMI</span>
                <strong className="primary-value">
                  {formatIndianCurrency(calculationResult.monthlyEmi)}
                </strong>
                <span className="primary-subtext">
                  Payable every month for {calculationResult.tenureMonths} months
                </span>
              </div>

              {/* Financial Metrics Summary Grid */}
              <div className="emi-metrics-grid">
                <div className="metric-box">
                  <span className="metric-title">Principal Amount</span>
                  <strong className="metric-amount principal-color">
                    {formatIndianCurrency(calculationResult.principalAmount)}
                  </strong>
                  <small className="metric-share">
                    {calculationResult.principalPercentage.toFixed(1)}% of total
                  </small>
                </div>

                <div className="metric-box">
                  <span className="metric-title">Total Interest</span>
                  <strong className="metric-amount interest-color">
                    {formatIndianCurrency(calculationResult.totalInterest)}
                  </strong>
                  <small className="metric-share">
                    {calculationResult.interestPercentage.toFixed(1)}% of total
                  </small>
                </div>

                <div className="metric-box full-width">
                  <span className="metric-title">Total Amount Payable</span>
                  <strong className="metric-amount total-color">
                    {formatIndianCurrency(calculationResult.totalRepayment)}
                  </strong>
                  <small className="metric-share">
                    Principal + Interest over {calculationResult.tenureMonths} months
                  </small>
                </div>
              </div>

              {/* Visual Breakdown Ratio Bar */}
              <div className="emi-breakdown-panel">
                <div className="breakdown-labels">
                  <span>
                    <i className="legend-dot principal-dot" aria-hidden="true" />
                    Principal ({calculationResult.principalPercentage.toFixed(1)}%)
                  </span>
                  <span>
                    <i className="legend-dot interest-dot" aria-hidden="true" />
                    Interest ({calculationResult.interestPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div
                  className="breakdown-bar"
                  role="progressbar"
                  aria-label="Principal vs Interest ratio"
                  aria-valuenow={Math.round(calculationResult.principalPercentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="breakdown-fill principal-fill"
                    style={{ width: `${calculationResult.principalPercentage}%` }}
                    title={`Principal: ${calculationResult.principalPercentage.toFixed(1)}%`}
                  />
                  <div
                    className="breakdown-fill interest-fill"
                    style={{ width: `${calculationResult.interestPercentage}%` }}
                    title={`Interest: ${calculationResult.interestPercentage.toFixed(1)}%`}
                  />
                </div>
              </div>

              {/* Ready to apply CTA if callback provided */}
              {onStartAssessment && (
                <div className="emi-assessment-bridge">
                  <div>
                    <strong>Ready to check your actual loan eligibility?</strong>
                    <p>Get a quick model-based prediction based on your full financial profile.</p>
                  </div>
                  <button
                    type="button"
                    className="bridge-cta-btn"
                    onClick={onStartAssessment}
                  >
                    Check Eligibility →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="emi-empty-state">
              <div className="empty-state-icon" aria-hidden="true">⌁</div>
              <h3>Ready to Calculate</h3>
              <p>
                Enter your loan amount, interest rate, and tenure on the left, then click{" "}
                <strong>Calculate EMI</strong> to view your monthly installment estimate and repayment breakdown.
              </p>
            </div>
          )}

          {/* Educational Disclaimer */}
          <footer className="emi-disclaimer">
            <p>
              <strong>Note:</strong> EMI is an estimate based on the loan amount, interest rate, and tenure
              you entered. Actual EMI may vary depending on the lender, processing fees, rate type (fixed vs floating),
              and other terms. This tool is for estimation and educational purposes only.
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
}
