import type { EmiCalculatorInput, EmiCalculationResult } from "../types/emi";

/**
 * Calculates the monthly reducing-balance EMI, total interest, and total repayment amount.
 * 
 * Formula:
 *   EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * 
 * Special case:
 *   When interest rate is 0%, EMI = P / n, total interest = 0.
 */
export function calculateEmi(input: EmiCalculatorInput): EmiCalculationResult {
  const { loanAmount, interestRate, tenure, tenureUnit } = input;

  const principalAmount = Number(loanAmount) || 0;
  const annualRate = Number(interestRate) || 0;
  const rawTenure = Number(tenure) || 0;

  // Convert tenure into total monthly installments
  const tenureMonths = tenureUnit === "years"
    ? Math.round(rawTenure * 12)
    : Math.round(rawTenure);

  if (principalAmount <= 0 || tenureMonths <= 0 || !Number.isFinite(principalAmount) || !Number.isFinite(tenureMonths)) {
    return {
      monthlyEmi: 0,
      totalInterest: 0,
      totalRepayment: 0,
      principalAmount: Math.max(0, principalAmount),
      tenureMonths: Math.max(0, tenureMonths),
      principalPercentage: 100,
      interestPercentage: 0,
    };
  }

  // Handle zero-interest case explicitly
  if (annualRate <= 0) {
    const monthlyEmi = principalAmount / tenureMonths;
    return {
      monthlyEmi,
      totalInterest: 0,
      totalRepayment: principalAmount,
      principalAmount,
      tenureMonths,
      principalPercentage: 100,
      interestPercentage: 0,
    };
  }

  // Monthly interest rate
  const monthlyRate = annualRate / 12 / 100;
  const compoundFactor = Math.pow(1 + monthlyRate, tenureMonths);

  if (!Number.isFinite(compoundFactor) || compoundFactor === 1) {
    const monthlyEmi = principalAmount / tenureMonths;
    return {
      monthlyEmi,
      totalInterest: 0,
      totalRepayment: principalAmount,
      principalAmount,
      tenureMonths,
      principalPercentage: 100,
      interestPercentage: 0,
    };
  }

  const monthlyEmi = (principalAmount * monthlyRate * compoundFactor) / (compoundFactor - 1);
  const totalRepayment = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalRepayment - principalAmount);

  const safeRepayment = totalRepayment > 0 ? totalRepayment : principalAmount;
  const principalPercentage = Math.min(100, Math.max(0, (principalAmount / safeRepayment) * 100));
  const interestPercentage = Math.min(100, Math.max(0, (totalInterest / safeRepayment) * 100));

  return {
    monthlyEmi: Number.isFinite(monthlyEmi) ? monthlyEmi : 0,
    totalInterest: Number.isFinite(totalInterest) ? totalInterest : 0,
    totalRepayment: Number.isFinite(totalRepayment) ? totalRepayment : principalAmount,
    principalAmount,
    tenureMonths,
    principalPercentage,
    interestPercentage,
  };
}

/**
 * Formats a numeric amount using the Indian numbering system and Rupee currency symbol (₹).
 */
export function formatIndianCurrency(amount: number, fractionDigits = 0): string {
  if (!Number.isFinite(amount)) return "₹0";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  }
}

/**
 * Formats a plain number using Indian numbering commas.
 */
export function formatIndianNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  try {
    return new Intl.NumberFormat("en-IN").format(value);
  } catch {
    return String(value);
  }
}
