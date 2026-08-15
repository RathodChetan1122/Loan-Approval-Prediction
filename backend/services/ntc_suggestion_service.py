from typing import Any


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

    annual_income = application["annual_income"]
    loan_amount = application["loan_amount"]
    loan_tenure = application["loan_tenure"]
    employment_type = application["employment_type"]
    dependents = application["dependents"]

    # --------------------------------------------------------
    # Loan amount vs income
    # --------------------------------------------------------

    loan_to_income = loan_amount / annual_income

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