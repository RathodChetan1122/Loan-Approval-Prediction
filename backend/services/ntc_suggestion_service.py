from typing import Any


def get_feature_action_guidance(
    feature: str,
    application: dict[str, Any],
) -> dict[str, Any]:
    """
    Generate tailored, credit-free action guidance for a specific
    negative contributor feature in an NTC application.
    """
    annual_income = application.get("annual_income", 0)
    loan_amount = application.get("loan_amount", 0)
    loan_tenure = application.get("loan_tenure", 10)
    employment_type = application.get("employment_type", "Private")
    dependents = application.get("dependents", 0)

    loan_to_income = loan_amount / annual_income if annual_income > 0 else 0

    if feature == "Loan_Amount":
        if loan_to_income > 5:
            rec = "Your requested loan amount is significantly higher than your annual income. Consider requesting a lower amount."
        elif loan_to_income > 3:
            rec = "Consider requesting a lower loan amount that aligns more closely with your declared annual income."
        else:
            rec = "Reviewing the requested loan amount to ensure optimal affordability can strengthen your application."

        return {
            "title": "Requested Loan Amount",
            "action_title": "Review requested loan amount",
            "recommendation": rec,
            "details": [
                "Applying for a loan amount closer to your annual earnings reduces repayment pressure.",
                "A lower principal amount can make the repayment commitment more manageable.",
            ],
        }

    if feature == "Loan_Tenure":
        if loan_tenure < 7 and loan_to_income > 2.5:
            rec = "Choosing a longer repayment tenure may lower your monthly EMI and improve affordability."
        elif loan_tenure > 20:
            rec = "A very long tenure increases overall interest cost. Consider optimizing the repayment timeline."
        else:
            rec = "Selecting a repayment tenure that balances monthly installment affordability is recommended."

        return {
            "title": "Loan Tenure",
            "action_title": "Evaluate repayment tenure options",
            "recommendation": rec,
            "details": [
                "A longer tenure spreads out repayments and reduces the monthly EMI burden.",
                "Ensure your chosen repayment duration aligns with your steady earning horizon.",
            ],
        }

    if feature == "Annual_Income":
        return {
            "title": "Annual Income",
            "action_title": "Strengthen demonstrated income & affordability",
            "recommendation": "A higher demonstrated annual income significantly improves borrowing capacity and approval likelihood.",
            "details": [
                "Ensure all regular and verifiable earnings are fully documented.",
                "Applying when your annual earnings increase helps support higher loan amounts comfortably.",
            ],
        }

    if feature == "Dependents":
        return {
            "title": "Household Dependents",
            "action_title": "Review household financial commitments",
            "recommendation": "Ensure your net income comfortably supports both family living expenses and proposed loan obligations.",
            "details": [
                "Higher household dependencies increase monthly living expenses, which lenders factor into affordability.",
                "Demonstrating consistent surplus savings after household expenses strengthens your application.",
            ],
        }

    if feature == "Employment_Type":
        if employment_type == "Unemployed":
            rec = "Securing a stable source of employment or regular income is essential to strengthen your application."
        else:
            rec = "Maintaining continuous and verified employment strengthens your repayment profile."

        return {
            "title": "Employment Profile",
            "action_title": "Establish stable employment or income proof",
            "recommendation": rec,
            "details": [
                "A continuous track record in your current occupation provides confidence to lenders.",
                "Maintaining steady earnings documentation helps validate repayment capacity.",
            ],
        }

    if feature == "Education":
        return {
            "title": "Education",
            "action_title": "Highlight completed educational qualifications",
            "recommendation": "Providing verified records of your highest completed education can support long-term earning profile assessment.",
            "details": [
                "Formal qualifications provide positive context regarding career trajectory and earning stability.",
            ],
        }

    return {
        "title": feature.replace("_", " "),
        "action_title": f"Review {feature.replace('_', ' ')}",
        "recommendation": "Review this factor to optimize your financial application.",
        "details": [],
    }


def generate_ntc_suggestions(
    application: dict[str, Any],
) -> list[str]:
    """
    Generate suggestions for New-To-Credit (NTC) applicants.

    These suggestions are based only on the six available
    applicant features and do not infer or estimate
    any credit score.
    """

    suggestions: list[str] = []

    annual_income = application.get("annual_income", 0)
    loan_amount = application.get("loan_amount", 0)
    loan_tenure = application.get("loan_tenure", 10)
    employment_type = application.get("employment_type", "Private")
    dependents = application.get("dependents", 0)

    # --------------------------------------------------------
    # Loan amount vs income
    # --------------------------------------------------------

    loan_to_income = loan_amount / annual_income if annual_income > 0 else 0

    if loan_to_income > 5:
        suggestions.append(
            "Consider requesting a lower loan amount or increasing your demonstrated annual income."
        )

    elif loan_to_income > 3:
        suggestions.append(
            "Your requested loan amount is relatively high compared to your annual income."
        )

    # --------------------------------------------------------
    # Loan tenure
    # --------------------------------------------------------

    if loan_to_income > 3 and loan_tenure < 7:
        suggestions.append(
            "Choosing a longer repayment tenure may improve affordability."
        )

    # --------------------------------------------------------
    # Employment
    # --------------------------------------------------------

    if employment_type == "Unemployed":
        suggestions.append(
            "A stable source of income or employment may strengthen your application."
        )

    # --------------------------------------------------------
    # Dependents
    # --------------------------------------------------------

    if dependents >= 3:
        suggestions.append(
            "Ensure your income comfortably supports your household responsibilities before applying."
        )

    # --------------------------------------------------------
    # Positive feedback
    # --------------------------------------------------------

    if not suggestions:
        suggestions.append(
            "Your financial profile does not indicate any major improvement areas based on the available information."
        )

    return suggestions