# Maximum Predicted Eligible Loan Amount Feature

## Objective

Add a new feature to the existing Loan Approval Prediction project.

The user enters the loan amount they want to apply for.

Example:

Requested Loan Amount = ₹10,00,000

The system should determine:

> Up to what amount, within the user's requested amount, does the existing ML model predict the loan as Approved?

For example:

₹10,00,000 -> Rejected
₹9,00,000 -> Rejected
₹8,00,000 -> Approved

Result:

Maximum Predicted Eligible Amount = ₹8,00,000

---

## IMPORTANT MODEL RULE

Do NOT:

- retrain the existing ML model
- replace the existing ML model
- modify the existing `.pkl` model
- create a second ML model
- change the existing approval prediction behavior

Existing production model:

backend/model/7_feature_loan_approval_model.pkl

The existing model must remain untouched.

---

## Core Logic

The user's requested loan amount is the UPPER LIMIT of the search.

Example:

Requested amount = ₹10,00,000

The system must NEVER search above ₹10,00,000.

Keep all other applicant information unchanged:

- Dependents
- Employment_Type
- Annual_Income
- Credit_Score
- Loan_Tenure
- Education

Only vary:

- Loan_Amount

Evaluate the existing production ML model for different loan amounts up to the requested amount.

Find the highest amount <= requested amount for which the existing model predicts:

Approved

---

## Example 1: Requested amount approved

Input:

Requested Loan Amount = ₹10,00,000

Model:

₹10,00,000 -> Approved

Result:

Maximum Predicted Eligible Amount = ₹10,00,000

Message:

"Based on your current applicant profile, the existing ML model predicts approval for your requested amount of ₹10,00,000."

---

## Example 2: Lower amount is eligible

Input:

Requested Loan Amount = ₹10,00,000

Model:

₹10,00,000 -> Rejected
₹9,00,000 -> Rejected
₹8,00,000 -> Approved

Result:

Maximum Predicted Eligible Amount = ₹8,00,000

Message:

"Your requested amount is ₹10,00,000, but based on your current applicant profile, the existing ML model predicts approval up to approximately ₹8,00,000."

Suggested reduction:

₹2,00,000

---

## Example 3: No eligible amount

If the model predicts Rejected for every evaluated amount up to the requested amount:

Result:

maximumEligibleLoanAmount = null

Status:

NO_ELIGIBLE_AMOUNT

Message:

"Based on your current applicant profile, the existing ML model does not predict approval for any evaluated loan amount up to your requested amount."

---

## Important Search Rule

The user's requested amount is always the upper search boundary.

Examples:

Requested = ₹5L
Maximum predicted amount can NEVER be greater than ₹5L.

Requested = ₹10L
Maximum predicted amount can NEVER be greater than ₹10L.

Requested = ₹20L
Maximum predicted amount can NEVER be greater than ₹20L.

Do NOT use a global maximum such as ₹1.025 Cr as the applicant's maximum.

---

## Search Algorithm

Use the existing ML model for prediction.

Keep all applicant fields fixed except Loan_Amount.

Use an efficient coarse-to-fine search where appropriate.

Do not assume approval is mathematically smooth.

Do not invent:

- income multipliers
- DTI formulas
- FOIR formulas
- credit-score formulas
- manually hard-coded eligibility rules

The result must come from the existing ML model.

---

## Existing Approval Result

The existing prediction for the user's requested amount must remain unchanged.

Example:

Requested = ₹10L

Existing model:

₹10L -> Rejected

The existing UI must continue showing:

Loan Approval: Rejected

The new feature additionally shows:

Maximum Predicted Eligible Amount: ₹8L

The new feature must NOT replace the existing approval result.

---

## UI Requirements

Show:

### Loan Approval

Approved / Rejected

### Requested Loan Amount

₹X

### Model-Predicted Eligible Amount

₹Y

### Approved Probability

XX.X%

---

## Contextual Messages

### If requested amount is approved

"Based on your current applicant profile, the existing ML model predicts approval for your requested amount of ₹X."

### If requested amount is above predicted eligible amount

"Your requested amount is above the model's predicted eligible amount. Suggested Maximum Amount: ₹Y."

### If no amount is eligible

"Based on your current applicant profile, the existing ML model does not predict loan approval for any evaluated loan amount up to your requested amount."

---

## Disclaimer

Always show:

"This is a model-predicted result based on the provided inputs, not a guaranteed bank loan approval."

---

## Testing

Test:

1. Requested amount is approved.
2. Requested amount is rejected but a lower amount is approved.
3. No amount is approved.
4. Different credit scores.
5. Different incomes.
6. Different employment types.
7. Different dependent counts.
8. Different requested amounts.

Verify:

- Existing prediction still works.
- Existing model file is unchanged.
- Existing preprocessing is unchanged.
- Maximum predicted amount never exceeds requested amount.
- No eligible amount is handled correctly.
- Frontend displays correct result.
- Backend returns correct result.
- Existing tests still pass.

---

## Git Rules

Do NOT automatically:

- commit
- push
- reset
- delete existing project files

Review changes first.

---

## Expected Architecture

Frontend
    ↓
Existing Loan Prediction API
    ↓
Existing prediction
    +
Maximum Eligible Amount Service
    ↓
Existing ML model
    ↓
Evaluate different Loan_Amount values
    ↓
Highest Approved amount <= Requested Amount
    ↓
Return result to frontend