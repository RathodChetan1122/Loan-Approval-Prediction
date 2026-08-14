export type TenureUnit = "years" | "months";

export interface EmiCalculatorInput {
  loanAmount: number;
  interestRate: number;
  tenure: number;
  tenureUnit: TenureUnit;
}

export interface EmiCalculationResult {
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  principalAmount: number;
  tenureMonths: number;
  principalPercentage: number;
  interestPercentage: number;
}
