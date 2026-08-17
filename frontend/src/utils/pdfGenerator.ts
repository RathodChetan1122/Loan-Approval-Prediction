import jsPDF from "jspdf";
import type { LoanApplication, PredictionResponse, ExplanationFactor, ActionPlanItem } from "../types/loan";

interface PdfOptions {
  application?: LoanApplication | null;
  result: PredictionResponse;
}

/**
 * Format currency in Indian Rupees with ASCII-safe prefix (e.g. Rs. 18,00,000)
 */
function formatInr(amount: number): string {
  try {
    const formatted = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
    return `Rs. ${formatted}`;
  } catch {
    return `Rs. ${amount.toLocaleString()}`;
  }
}

/**
 * Sanitize text to remove or replace non-WinAnsi characters (e.g. ₹ -> Rs., ✓ -> [✓])
 */
function cleanPdfText(text: string): string {
  if (!text) return "";
  return text
    .replace(/₹\s*/g, "Rs. ")
    .replace(/[✓✔]/g, "")
    .replace(/[✕✖✗×]/g, "")
    .replace(/[•●]/g, "-")
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[–—]/g, "-")
    .trim();
}

/**
 * Generate unique report reference: LAP-YYYYMMDD-XXXX
 */
function generateReportReference(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
  return `LAP-${year}${month}${day}-${randomHex}`;
}

/**
 * Format current date/time in Indian format
 */
function formatReportTimestamp(): string {
  const now = new Date();
  return now.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Draw vector brand logo on jsPDF canvas
 */
function drawVectorLogo(doc: jsPDF, x: number, y: number, size: number = 22) {
  const scale = size / 100;
  doc.saveGraphicsState();

  // Bars
  doc.setFillColor(28, 115, 180); // #1C73B4
  doc.roundedRect(x + 30 * scale, y + 44 * scale, 10 * scale, 36 * scale, 1.5 * scale, 1.5 * scale, "F");
  doc.roundedRect(x + 45 * scale, y + 30 * scale, 10 * scale, 50 * scale, 1.5 * scale, 1.5 * scale, "F");
  doc.roundedRect(x + 60 * scale, y + 16 * scale, 10 * scale, 64 * scale, 1.5 * scale, 1.5 * scale, "F");

  // Circle outline
  doc.setDrawColor(11, 92, 151); // #0B5C97
  doc.setLineWidth(5.5 * scale);
  doc.circle(x + 50 * scale, y + 50 * scale, 40 * scale, "S");

  // Arrow
  doc.setDrawColor(0, 31, 62); // #001F3E
  doc.setLineWidth(6 * scale);
  doc.line(x + 18 * scale, y + 80 * scale, x + 35 * scale, y + 48 * scale);
  doc.line(x + 35 * scale, y + 48 * scale, x + 50 * scale, y + 64 * scale);
  doc.line(x + 50 * scale, y + 64 * scale, x + 74 * scale, y + 34 * scale);

  doc.restoreGraphicsState();
}

export function generateLoanAssessmentPdf({ application, result }: PdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm
  let currentY = 14;

  const isApproved = result.prediction === "Approved";
  const approvedPct = (result.approved_probability * 100).toFixed(2);
  const rejectedPct = (result.rejected_probability * 100).toFixed(2);
  const reportRef = generateReportReference();
  const timestamp = formatReportTimestamp();

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      doc.addPage();
      currentY = 16;
      drawPageHeaderCompact();
    }
  };

  const drawPageHeaderCompact = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("LOAN APPROVAL PREDICTION | ASSESSMENT REPORT", marginX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`Ref: ${reportRef}`, pageWidth - marginX, currentY, { align: "right" });
    currentY += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 7;
  };

  // ==========================================================
  // 1. MAIN REPORT HEADER BANNER
  // ==========================================================
  doc.setFillColor(11, 39, 72); // Dark Navy #0B2748
  doc.roundedRect(marginX, currentY, contentWidth, 32, 3.5, 3.5, "F");

  // Draw Logo & Brand Title
  drawVectorLogo(doc, marginX + 5, currentY + 5, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("LOAN APPROVAL PREDICTION", marginX + 30, currentY + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(147, 197, 253); // #93C5FD
  doc.text("OFFICIAL LOAN ASSESSMENT REPORT", marginX + 30, currentY + 20);

  // Header Right Metadata
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${timestamp}`, pageWidth - marginX - 6, currentY + 11.5, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Reference: ${reportRef}`, pageWidth - marginX - 6, currentY + 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Status: Verified Model Evaluation", pageWidth - marginX - 6, currentY + 24.5, { align: "right" });

  currentY += 38;

  // ==========================================================
  // 2. OUTCOME & PROBABILITY SUMMARY CARD
  // ==========================================================
  checkPageBreak(30);
  const outcomeBgColor: [number, number, number] = isApproved ? [240, 253, 244] : [254, 242, 242];
  const outcomeBorderColor: [number, number, number] = isApproved ? [187, 247, 208] : [254, 202, 202];
  const outcomeBadgeColor: [number, number, number] = isApproved ? [22, 163, 74] : [220, 38, 38];

  doc.setFillColor(...outcomeBgColor);
  doc.setDrawColor(...outcomeBorderColor);
  doc.setLineWidth(0.6);
  doc.roundedRect(marginX, currentY, contentWidth, 24, 3, 3, "FD");

  // Outcome Badge
  const badgeWidth = isApproved ? 30 : 36;
  doc.setFillColor(...outcomeBadgeColor);
  doc.roundedRect(marginX + 6, currentY + 4.5, badgeWidth, 6.5, 1.8, 1.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(isApproved ? "APPROVED" : "NOT ELIGIBLE", marginX + 6 + badgeWidth / 2, currentY + 8.8, {
    align: "center",
  });

  // Outcome Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(
    isApproved ? "Predicted Outcome: Likely Eligible" : "Predicted Outcome: Predicted Not Eligible",
    marginX + 6 + badgeWidth + 5,
    currentY + 9.2
  );

  // Probabilities Dual Display
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52); // Green
  doc.text(`Approval Probability: ${approvedPct}%`, marginX + 6, currentY + 18.5);

  doc.setTextColor(153, 27, 27); // Red
  doc.text(`Rejection Probability: ${rejectedPct}%`, marginX + contentWidth / 2 + 4, currentY + 18.5);

  currentY += 29;

  // ==========================================================
  // 3. APPLICANT & LOAN DETAILS (2 SYMMETRICAL COLUMNS)
  // ==========================================================
  checkPageBreak(48);

  const colWidth = (contentWidth - 6) / 2; // 86mm each
  const isNTC = application && 'monthly_expenses' in application;
  const colHeight = isNTC ? 60 : 42;

  // Left Card: Applicant Profile
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, colWidth, colHeight, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("APPLICANT PROFILE", marginX + 6, currentY + 7);

  const dependentsVal =
    application?.dependents !== undefined
      ? `${application.dependents} ${application.dependents === 1 ? "dependent" : "dependents"}`
      : "0 dependents";

  const employmentVal = cleanPdfText(application?.employment_type || "Private");
  const educationVal = cleanPdfText(application?.education || "Graduate");
  const incomeVal = application?.annual_income ? formatInr(application.annual_income) : "Rs. 6,00,000";
  const creditScoreVal = application?.credit_score ? `${application.credit_score}` : "650 (NTC)";
  const requestedLoanVal = formatInr(application?.loan_amount || result.loan_amount_analysis?.currentAmount || 1000000);
  const tenureVal = `${application?.loan_tenure || 5} years`;

  const applicantRows = [
    { label: "Dependents:", val: dependentsVal },
    { label: "Employment:", val: employmentVal },
    { label: "Education:", val: educationVal },
    { label: "Annual Income:", val: incomeVal },
  ];
  
  if (isNTC) {
    const ntcApp = application as any;
    const ntcRes = result as any;
    applicantRows.push({ label: "Monthly Income:", val: formatInr(ntcRes.monthly_income || (ntcApp.annual_income / 12)) });
    applicantRows.push({ label: "Monthly Expenses:", val: formatInr(ntcApp.monthly_expenses || 0) });
    applicantRows.push({ label: "Disposable Income:", val: formatInr(ntcRes.disposable_income || 0) });
    applicantRows.push({ label: "Expense Ratio:", val: `${(ntcRes.expense_ratio || 0).toFixed(1)}%` });
  } else {
    applicantRows.push({ label: "Credit Score (CIBIL):", val: creditScoreVal });
  }

  let applicantY = currentY + 13.5;
  applicantRows.forEach((row) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    doc.text(row.label, marginX + 6, applicantY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(row.val, marginX + colWidth - 6, applicantY, { align: "right" });
    applicantY += 5.6;
  });

  // Right Card: Loan Application Details
  const rightColX = marginX + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightColX, currentY, colWidth, colHeight, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("LOAN APPLICATION DETAILS", rightColX + 6, currentY + 7);

  const loanRows = [
    { label: "Requested Loan Amount:", val: requestedLoanVal },
    { label: "Repayment Tenure:", val: tenureVal },
    { label: "Loan Product:", val: "Personal / Term Loan" },
    { label: "Assessment Type:", val: "ML Automated Model" },
    { label: "Decision Confidence:", val: `${Math.max(result.approved_probability, result.rejected_probability) * 100 > 90 ? "High" : "Standard"}` },
  ];

  let loanY = currentY + 13.5;
  loanRows.forEach((row) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    doc.text(row.label, rightColX + 6, loanY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(row.val, rightColX + colWidth - 6, loanY, { align: "right" });
    loanY += 5.6;
  });

  currentY += colHeight + 7;

  // ==========================================================
  // 3.5 LOAN AMOUNT WHAT-IF ANALYSIS
  // ==========================================================
  const whatIf = result.loan_amount_analysis;
  if (whatIf && !isNTC) {
    checkPageBreak(35);
    
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, currentY, contentWidth, 34, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("ESTIMATED LOAN CAPACITY", marginX + 6, currentY + 7);

    let leftText = `Requested Amount: ${formatInr(whatIf.currentAmount)}\nStatus: ${isApproved ? "Approved" : "Rejected"}`;
    let rightText = "";
    
    if (whatIf.recommendedAmount > 0) {
      rightText = `Maximum Predicted Eligible Amount: ${formatInr(whatIf.recommendedAmount)}\nApproval probability at this amount: ${whatIf.recommendedApprovalProbability.toFixed(1)}%`;
      if (whatIf.recommendedAmount < whatIf.currentAmount) {
        rightText += `\nSuggested Reduction: ${formatInr(whatIf.currentAmount - whatIf.recommendedAmount)}`;
      }
    } else {
      rightText = `Maximum Predicted Eligible Amount: No eligible amount found`;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(71, 85, 105);
    doc.text(leftText, marginX + 6, currentY + 14);
    doc.text(rightText, marginX + contentWidth / 2 + 2, currentY + 14);
    
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("* This is a model-based simulation, not a lender decision or guarantee of approval.", marginX + 6, currentY + 30);
    
    currentY += 41;
    currentY += 41;
  }

  // ==========================================================
  // 3.6 NTC ESTIMATED LOAN CAPACITY
  // ==========================================================
  if (isNTC && "maximum_eligible_amount" in result) {
    const ntcRes = result as any;
    checkPageBreak(35);
    
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, currentY, contentWidth, 34, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("NTC ESTIMATED LOAN CAPACITY", marginX + 6, currentY + 7);

    let leftText = `Requested Amount: ${formatInr(ntcRes.requested_loan_amount)}\nStatus: ${ntcRes.prediction}`;
    let rightText = "";
    
    if (ntcRes.maximum_eligible_amount !== null) {
      rightText = `Maximum Predicted Eligible Amount: ${formatInr(ntcRes.maximum_eligible_amount)}\nApproval probability at this amount: ${(ntcRes.max_eligible_approved_probability * 100).toFixed(1)}%`;
      if (ntcRes.maximum_eligible_amount < ntcRes.requested_loan_amount) {
        rightText += `\nSuggested Reduction: ${formatInr(ntcRes.requested_loan_amount - ntcRes.maximum_eligible_amount)}`;
      }
    } else {
      rightText = `Maximum Predicted Eligible Amount: No eligible amount found`;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(71, 85, 105);
    doc.text(leftText, marginX + 6, currentY + 14);
    doc.text(rightText, marginX + contentWidth / 2 + 2, currentY + 14);
    
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("* " + ntcRes.max_loan_message, marginX + 6, currentY + 30);
    
    currentY += 41;
  }

  // ==========================================================
  // 4. MODEL EXPLAINABILITY / WHY THIS RESULT?
  // ==========================================================
  const explanation = result.explanation;

  if (!isApproved && explanation && explanation.top_negative_factors.length > 0) {
    checkPageBreak(26);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("WHY THIS RESULT? — MODEL EXPLAINABILITY", marginX, currentY);
    currentY += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "The machine learning model evaluated your application and identified the following primary factors that influenced this assessment:",
      marginX,
      currentY
    );
    currentY += 5.5;

    explanation.top_negative_factors.forEach((factor: ExplanationFactor, idx: number) => {
      const cleanExpl = cleanPdfText(factor.explanation);
      const cleanVal = cleanPdfText(factor.user_value);
      const factorLabel = `${idx + 1}. ${cleanPdfText(factor.label)}`;
      const splitText = doc.splitTextToSize(cleanExpl, contentWidth - 18);
      const cardHeight = Math.max(18, 10 + splitText.length * 3.6 + 4);

      checkPageBreak(cardHeight + 4);

      // Card for negative factor
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(254, 226, 226);
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 2.5, 2.5, "FD");

      // Impact indicator dot
      const isStrong = factor.impact_level.includes("Strong");
      doc.setFillColor(isStrong ? 220 : 217, isStrong ? 38 : 119, isStrong ? 38 : 6);
      doc.circle(marginX + 5.5, currentY + 5.2, 1.8, "F");

      // Factor Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      doc.setTextColor(15, 23, 42);
      doc.text(factorLabel, marginX + 10, currentY + 6.2);

      // Dynamic Badge Pill
      const titleWidth = doc.getTextWidth(factorLabel);
      const badgeText = factor.impact_level;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      const badgeWidth = doc.getTextWidth(badgeText) + 4;
      const badgeX = marginX + 10 + titleWidth + 3;

      doc.setFillColor(254, 242, 242);
      doc.roundedRect(badgeX, currentY + 3.2, badgeWidth, 4.6, 1, 1, "F");
      doc.setTextColor(185, 28, 28);
      doc.text(badgeText, badgeX + 2, currentY + 6.4);

      // User Value
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Your value: ${cleanVal}`, pageWidth - marginX - 6, currentY + 6.2, { align: "right" });

      // Interior Divider Line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.25);
      doc.line(marginX + 5, currentY + 9.5, pageWidth - marginX - 5, currentY + 9.5);

      // Explanation text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(splitText, marginX + 10, currentY + 13.5);

      currentY += cardHeight + 3;
    });
  }

  // ==========================================================
  // 5. WHAT WORKED IN YOUR FAVOR
  // ==========================================================
  if (explanation && explanation.positive_factors && explanation.positive_factors.length > 0) {
    checkPageBreak(24);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(22, 101, 52); // Green
    doc.text("WHAT WORKED IN YOUR FAVOR", marginX, currentY);
    currentY += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "The machine learning model identified the following supportive factors in your assessment:",
      marginX,
      currentY
    );
    currentY += 5.5;

    explanation.positive_factors.forEach((factor: ExplanationFactor) => {
      const cleanExpl = cleanPdfText(factor.explanation);
      const cleanVal = cleanPdfText(factor.user_value);
      const factorLabel = cleanPdfText(factor.label);
      const splitText = doc.splitTextToSize(cleanExpl, contentWidth - 18);
      const cardHeight = Math.max(18, 10 + splitText.length * 3.6 + 4);

      checkPageBreak(cardHeight + 4);

      // Card for positive factor
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 2.5, 2.5, "FD");

      // Green indicator dot
      doc.setFillColor(22, 163, 74);
      doc.circle(marginX + 5.5, currentY + 5.2, 1.8, "F");

      // Factor Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      doc.setTextColor(15, 23, 42);
      doc.text(factorLabel, marginX + 10, currentY + 6.2);

      // Dynamic Badge Pill
      const titleWidth = doc.getTextWidth(factorLabel);
      const badgeText = factor.impact_level;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      const badgeWidth = doc.getTextWidth(badgeText) + 4;
      const badgeX = marginX + 10 + titleWidth + 3;

      doc.setFillColor(220, 252, 231);
      doc.roundedRect(badgeX, currentY + 3.2, badgeWidth, 4.6, 1, 1, "F");
      doc.setTextColor(22, 101, 52);
      doc.text(badgeText, badgeX + 2, currentY + 6.4);

      // User Value
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Your value: ${cleanVal}`, pageWidth - marginX - 6, currentY + 6.2, { align: "right" });

      // Interior Divider Line
      doc.setDrawColor(220, 240, 230);
      doc.setLineWidth(0.25);
      doc.line(marginX + 5, currentY + 9.5, pageWidth - marginX - 5, currentY + 9.5);

      // Explanation Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(splitText, marginX + 10, currentY + 13.5);

      currentY += cardHeight + 3;
    });
  }

  // ==========================================================
  // 6. PERSONALIZED ACTION PLAN (FOR REJECTIONS)
  // ==========================================================
  if (!isApproved && explanation && explanation.action_plan && explanation.action_plan.length > 0) {
    // If we are past midway on Page 1, start Action Plan cleanly at the top of Page 2 for perfect visual balance
    if (currentY > 160) {
      doc.addPage();
      currentY = 16;
      drawPageHeaderCompact();
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("PERSONALIZED ACTION PLAN — HOW CAN I IMPROVE MY ELIGIBILITY?", marginX, currentY);
    currentY += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Here are recommended steps tailored to the factors that influenced this assessment. These actions do not guarantee future approval.",
      marginX,
      currentY
    );
    currentY += 6;

    explanation.action_plan.forEach((item: ActionPlanItem) => {
      const cleanReason = cleanPdfText(item.reason);
      const cleanRec = cleanPdfText(item.recommendation);
      const splitReason = doc.splitTextToSize(cleanReason, contentWidth - 36);
      const splitRec = doc.splitTextToSize(cleanRec, contentWidth - 36);

      const reasonHeight = splitReason.length * 3.6;
      const recHeight = splitRec.length * 3.6;
      const cardHeight = Math.max(26, 13 + reasonHeight + recHeight + 4);

      checkPageBreak(cardHeight + 4);

      // Main Action Card
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 2.5, 2.5, "FD");

      // Top Row: Priority Badge
      doc.setFillColor(36, 92, 171); // #245CAB
      doc.roundedRect(marginX + 5, currentY + 3.5, 18, 5.2, 1.2, 1.2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(255, 255, 255);
      doc.text(`PRIORITY 0${item.priority}`, marginX + 6, currentY + 7.2);

      // Action Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      doc.setTextColor(15, 23, 42);
      doc.text(cleanPdfText(item.title), marginX + 26, currentY + 7.2);

      // Factor Label Tag (Right-aligned)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${cleanPdfText(item.factor_label)}]`, pageWidth - marginX - 6, currentY + 7.2, { align: "right" });

      // Subtle Divider inside Card
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX + 5, currentY + 10.5, pageWidth - marginX - 5, currentY + 10.5);

      // Row 1: Why This Matters
      let rowCursorY = currentY + 14.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(11, 39, 72);
      doc.text("WHY THIS MATTERS:", marginX + 6, rowCursorY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(51, 65, 85);
      doc.text(splitReason, marginX + 32, rowCursorY);

      rowCursorY += reasonHeight + 2.5;

      // Row 2: Recommended Action
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(36, 92, 171);
      doc.text("RECOMMENDED:", marginX + 6, rowCursorY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(30, 58, 138);
      doc.text(splitRec, marginX + 32, rowCursorY);

      currentY += cardHeight + 3.5;
    });
  }

  // ==========================================================
  // 7. APPROVED SUGGESTIONS & NEXT STEPS
  // ==========================================================
  if (isApproved && result.suggestions && result.suggestions.length > 0) {
    checkPageBreak(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("SUGGESTIONS & NEXT STEPS", marginX, currentY);
    currentY += 4.5;

    result.suggestions.forEach((sug: string) => {
      const cleanSug = cleanPdfText(sug);
      const splitText = doc.splitTextToSize(cleanSug, contentWidth - 14);
      const cardHeight = Math.max(9, 5 + splitText.length * 3.5);

      checkPageBreak(cardHeight + 2.5);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 1.8, 1.8, "FD");

      doc.setFillColor(22, 163, 74);
      doc.circle(marginX + 5, currentY + cardHeight / 2, 1.2, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(splitText, marginX + 9, currentY + 5.5);

      currentY += cardHeight + 2.5;
    });
  }

  // ==========================================================
  // 8. MODEL & TECHNICAL SPECIFICATIONS
  // ==========================================================
  checkPageBreak(20);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text("SYSTEM & MODEL INFORMATION", marginX + 5, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text("Model Architecture: Gradient Boosting Classifier (7-feature-gb-v2) | Type: Supervised Binary Eligibility Classifier", marginX + 5, currentY + 9.2);
  doc.text("Features: Dependents, Employment_Type, Annual_Income, Credit_Score, Loan_Amount, Loan_Tenure, Education", marginX + 5, currentY + 13);

  currentY += 19;

  // ==========================================================
  // 9. DISCLAIMER BOX
  // ==========================================================
  checkPageBreak(18);

  doc.setFillColor(255, 251, 235); // Amber Tint
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(180, 83, 9);
  doc.text("IMPORTANT NOTICE / DISCLAIMER", marginX + 5, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(120, 53, 15);
  const disclaimerText =
    "This report contains a model-based loan assessment generated by the Loan Approval Prediction application. It is not an official loan sanction letter, approval certificate, or bank guarantee. Final lending decisions are made by respective financial institutions based on their independent verification criteria and underwriting policies.";
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  doc.text(splitDisclaimer, marginX + 5, currentY + 9);

  // ==========================================================
  // 10. DYNAMIC PAGE NUMBERING ON ALL PAGES
  // ==========================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 9, pageWidth - marginX, pageHeight - 9);

    doc.text("Loan Approval Prediction | Confidential Loan Assessment Report", marginX, pageHeight - 5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 5, { align: "right" });
  }

  // Trigger download
  const safeRef = reportRef.replace(/[^a-zA-Z0-9-]/g, "_");
  doc.save(`Loan_Assessment_Report_${safeRef}.pdf`);
}

