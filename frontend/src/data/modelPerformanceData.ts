export const modelOverview = {
  modelName: "Gradient Boosting Classifier",
  modelVersion: "7-feature-gb-v2",
  artifactName: "loan_model.pkl",
  task: "Binary Loan Approval Classification",
  status: "Production",
  featuresCount: 7,
};

export const evaluationSetup = {
  totalRecords: 20000,
  trainingRecords: 16000,
  testingRecords: 4000,
  splitMethod: "Stratified 80/20 train/test split",
  randomState: 42,
  crossValidation: "Not used"
};

export const keyMetrics = {
  accuracy: "93.20%",
  precision: "93.11%",
  recall: "95.00%",
  f1Score: "94.05%",
  rocAuc: "98.35%",
};

export const modelComparison = [
  { name: "LightGBM", accuracy: 93.62, precision: 93.88, recall: 94.92, f1: 94.39, rocAuc: 98.59 },
  { name: "XGBoost", accuracy: 93.75, precision: 94.05, recall: 94.96, f1: 94.50, rocAuc: 98.58 },
  { name: "Gradient Boosting", accuracy: 93.20, precision: 93.11, recall: 95.00, f1: 94.05, rocAuc: 98.35, selected: true },
  { name: "Random Forest", accuracy: 90.90, precision: 89.41, recall: 95.18, f1: 92.21, rocAuc: 97.11 },
  { name: "Logistic Regression", accuracy: 88.60, precision: 88.46, recall: 91.82, f1: 90.11, rocAuc: 95.53 },
  { name: "Decision Tree", accuracy: 86.02, precision: 84.43, recall: 92.31, f1: 88.19, rocAuc: 92.73 },
];

export const featureImportance = {
  native: [
    { feature: "Credit_Score", value: 52.72 },
    { feature: "Loan_Tenure", value: 17.83 },
    { feature: "Annual_Income", value: 14.40 },
    { feature: "Loan_Amount", value: 8.56 },
    { feature: "Employment_Type", value: 3.73 },
    { feature: "Dependents", value: 2.34 },
    { feature: "Education", value: 0.43 },
  ],
  permutation: [
    { feature: "Credit_Score", value: 33.92 },
    { feature: "Loan_Tenure", value: 27.38 },
    { feature: "Annual_Income", value: 18.17 },
    { feature: "Loan_Amount", value: 14.34 },
    { feature: "Dependents", value: 3.73 },
    { feature: "Employment_Type", value: 2.10 },
    { feature: "Education", value: 0.36 },
  ],
  shap: [
    { feature: "Credit_Score", value: 29.79 },
    { feature: "Loan_Tenure", value: 24.26 },
    { feature: "Annual_Income", value: 16.89 },
    { feature: "Loan_Amount", value: 16.07 },
    { feature: "Dependents", value: 6.30 },
    { feature: "Employment_Type", value: 4.66 },
    { feature: "Education", value: 2.02 },
  ]
};

export const ablationStudy = [
  { name: "Full 7 Features", accuracy: 93.20 },
  { name: "Credit Score Only", accuracy: 77.60 },
  { name: "Without Credit Score", accuracy: 75.90 },
];

export const confusionMatrix = {
  actualRejected: { predictedRejected: 1579, predictedApproved: 159 },
  actualApproved: { predictedRejected: 113, predictedApproved: 2149 }
};

export const behavioralScenarios = [
  { name: "HIGH CIBIL + HIGH RISK", result: "Rejected" },
  { name: "MODERATE CIBIL + STRONG PROFILE", result: "Approved" },
  { name: "HIGH CIBIL + STRONG FINANCIAL PROFILE", result: "Approved" },
  { name: "LOW CIBIL + HIGH FINANCIAL RISK", result: "Rejected" }
];

export const inputFeatures = [
  {
    name: "Credit Score",
    description: "Creditworthiness indicator used by the model as the strongest individual predictor."
  },
  {
    name: "Annual Income",
    description: "Applicant annual income used to assess financial capacity."
  },
  {
    name: "Loan Amount",
    description: "Requested loan amount considered relative to the applicant's financial profile."
  },
  {
    name: "Loan Tenure",
    description: "Requested repayment duration considered by the model."
  },
  {
    name: "Employment Type",
    description: "Employment category used as an indicator of income stability."
  },
  {
    name: "Dependents",
    description: "Number of dependents considered as part of the applicant's financial responsibility."
  },
  {
    name: "Education",
    description: "Education category included as a smaller but measurable model input."
  }
];
