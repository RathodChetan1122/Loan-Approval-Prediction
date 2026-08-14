import { useState } from "react";
import scatterPlotImg from "../assets/scatter_plot.png";
import {
  modelOverview,
  keyMetrics,
  modelComparison,
  featureImportance,
  ablationStudy,
  confusionMatrix,
  behavioralScenarios,
  inputFeatures,
  evaluationSetup
} from "../data/modelPerformanceData";

interface Props {
  onBack: () => void;
}

export default function ModelPerformance({ onBack }: Props) {
  const [importanceMethod, setImportanceMethod] = useState<"native" | "permutation" | "shap">("native");

  const renderImportanceDescription = () => {
    switch (importanceMethod) {
      case "native": return "Native model feature importance. Shows the relative contribution within the Gradient Boosting model's learned decision structure.";
      case "permutation": return "Permutation Importance. Performance impact when each feature is independently shuffled.";
      case "shap": return "SHAP-based feature importance. Average absolute SHAP contribution across evaluated samples.";
    }
  };

  return (
    <div className="model-performance-page">
      <header className="mp-header">
        <button className="mp-back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <span className="mp-eyebrow">MODEL PERFORMANCE</span>
        <h1>Understand the AI model behind LoanWise</h1>
        <p>Explore the accuracy, feature importance, and transparency insights of our production model.</p>
      </header>

      <section className="mp-section mp-overview">
        <h2>Model Overview</h2>
        <div className="mp-grid-4">
          <div className="mp-card">
            <span>Model</span>
            <strong>{modelOverview.modelName}</strong>
          </div>
          <div className="mp-card">
            <span>Version & Artifact</span>
            <strong>{modelOverview.modelVersion}</strong>
            <small>{modelOverview.artifactName}</small>
          </div>
          <div className="mp-card">
            <span>Task</span>
            <strong>{modelOverview.task}</strong>
          </div>
          <div className="mp-card">
            <span>Status</span>
            <strong className="mp-status-badge">{modelOverview.status}</strong>
          </div>
        </div>
      </section>

      <section className="mp-section mp-kpis">
        <h2>Key Performance</h2>
        <p>Evaluation results from the validated 7-feature Gradient Boosting model.</p>
        <div className="mp-grid-5">
          <div className="mp-kpi-card">
            <strong>{keyMetrics.accuracy}</strong>
            <span>Accuracy</span>
          </div>
          <div className="mp-kpi-card">
            <strong>{keyMetrics.precision}</strong>
            <span>Precision</span>
          </div>
          <div className="mp-kpi-card">
            <strong>{keyMetrics.recall}</strong>
            <span>Recall</span>
          </div>
          <div className="mp-kpi-card">
            <strong>{keyMetrics.f1Score}</strong>
            <span>F1 Score</span>
          </div>
          <div className="mp-kpi-card">
            <strong>{keyMetrics.rocAuc}</strong>
            <span>ROC-AUC</span>
          </div>
        </div>
      </section>

      <section className="mp-section mp-comparison">
        <h2>Model Comparison</h2>
        <p>Gradient Boosting was selected because it provides a strong performance/interpretability balance while maintaining Credit Score as the strongest individual predictor without excessive dominance.</p>
        <div className="mp-chart-container">
          {modelComparison.map((model) => (
            <div key={model.name} className={`mp-bar-row ${model.selected ? "mp-selected" : ""}`}>
              <div className="mp-bar-label">{model.name} {model.selected && "(Deployed)"}</div>
              <div className="mp-bar-track">
                <div className="mp-bar-fill" style={{ width: `${model.accuracy}%` }}></div>
              </div>
              <div className="mp-bar-value">{model.accuracy.toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mp-section mp-importance">
        <h2>How the model weighs applicant features</h2>
        <div className="mp-tabs">
          <button className={importanceMethod === "native" ? "active" : ""} onClick={() => setImportanceMethod("native")}>Native</button>
          <button className={importanceMethod === "permutation" ? "active" : ""} onClick={() => setImportanceMethod("permutation")}>Permutation</button>
          <button className={importanceMethod === "shap" ? "active" : ""} onClick={() => setImportanceMethod("shap")}>SHAP</button>
        </div>
        <p className="mp-tab-desc">{renderImportanceDescription()}</p>
        <div className="mp-chart-container">
          {featureImportance[importanceMethod].map((feat) => (
            <div key={feat.feature} className="mp-bar-row">
              <div className="mp-bar-label">{feat.feature.replace("_", " ")}</div>
              <div className="mp-bar-track">
                <div className="mp-bar-fill" style={{ width: `${feat.value}%` }}></div>
              </div>
              <div className="mp-bar-value">{feat.value.toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mp-section mp-ablation">
        <h2>Does the model depend only on Credit Score?</h2>
        <p><strong>No.</strong> Credit Score is the strongest individual predictor, but the other features provide meaningful predictive information. The full seven-feature model performs substantially better than either the Credit Score-only model or the model without Credit Score.</p>
        <div className="mp-chart-container mp-chart-ablation">
          {ablationStudy.map((study) => (
            <div key={study.name} className="mp-bar-row">
              <div className="mp-bar-label">{study.name}</div>
              <div className="mp-bar-track">
                <div className="mp-bar-fill" style={{ width: `${study.accuracy}%` }}></div>
              </div>
              <div className="mp-bar-value">{study.accuracy.toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mp-section mp-scatter-plot">
        <h2>Credit Score vs Loan Approval Probability</h2>
        <p>Applicants with similar Credit Scores can still receive different predicted probabilities because the model also considers income, loan amount, tenure, employment, dependents, and education.</p>
        <div style={{ textAlign: "center", marginTop: "24px", background: "#fbfdff", padding: "20px", borderRadius: "16px", border: "1px solid var(--border)" }}>
          <img src={scatterPlotImg} alt="Credit Score vs Loan Approval Probability Scatter Plot" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} />
        </div>
      </section>

      <div className="mp-grid-2">
        <section className="mp-section mp-confusion">
          <h2>Confusion Matrix</h2>
          <p>Prediction results on the 4,000-record test set.</p>
          <div className="mp-cm-grid">
            <div className="mp-cm-header"></div>
            <div className="mp-cm-header">Predicted Rejected</div>
            <div className="mp-cm-header">Predicted Approved</div>
            
            <div className="mp-cm-row-label">Actual Rejected</div>
            <div className="mp-cm-cell mp-cm-true-negative">
              <strong>{confusionMatrix.actualRejected.predictedRejected}</strong>
            </div>
            <div className="mp-cm-cell mp-cm-false-positive">
              <strong>{confusionMatrix.actualRejected.predictedApproved}</strong>
            </div>

            <div className="mp-cm-row-label">Actual Approved</div>
            <div className="mp-cm-cell mp-cm-false-negative">
              <strong>{confusionMatrix.actualApproved.predictedRejected}</strong>
            </div>
            <div className="mp-cm-cell mp-cm-true-positive">
              <strong>{confusionMatrix.actualApproved.predictedApproved}</strong>
            </div>
          </div>
        </section>

        <section className="mp-section mp-scenarios">
          <h2>Behavioral Validation</h2>
          <p>Controlled scenario validation</p>
          <div className="mp-scenario-list">
            {behavioralScenarios.map((scenario) => (
              <div key={scenario.name} className={`mp-scenario-card result-${scenario.result.toLowerCase()}`}>
                <strong>{scenario.name}</strong>
                <span className="mp-badge">{scenario.result}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mp-section mp-features">
        <h2>Model Inputs</h2>
        <div className="mp-grid-3">
          {inputFeatures.map((feat) => (
            <div key={feat.name} className="mp-card">
              <strong>{feat.name}</strong>
              <p>{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mp-section mp-methodology">
        <div className="mp-grid-2">
          <div>
            <h2>Evaluation Setup</h2>
            <ul className="mp-list">
              <li><strong>Total dataset:</strong> {evaluationSetup.totalRecords.toLocaleString()} records</li>
              <li><strong>Training:</strong> {evaluationSetup.trainingRecords.toLocaleString()} samples</li>
              <li><strong>Testing:</strong> {evaluationSetup.testingRecords.toLocaleString()} samples</li>
              <li><strong>Split:</strong> {evaluationSetup.splitMethod}</li>
              <li><strong>Random State:</strong> {evaluationSetup.randomState}</li>
              <li><strong>Cross-validation:</strong> {evaluationSetup.crossValidation}</li>
            </ul>
          </div>
          <div>
            <h2>Important Limitations</h2>
            <ul className="mp-list">
              <li>Evaluation metrics come from the available test dataset.</li>
              <li>Model performance does not guarantee real-world lending outcomes.</li>
              <li>Prediction probabilities are model estimates, not lender decisions.</li>
              <li>Actual decisions may use additional information and policies.</li>
              <li>Feature importance indicates model behavior, not causation.</li>
              <li>This system is a prediction aid, not financial advice.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mp-footer">
        <p><strong>Disclaimer:</strong> Model performance shown on this page reflects evaluation results for the deployed model. It does not guarantee the outcome of any individual loan application. Actual lending decisions are made by lenders using their own criteria and processes.</p>
      </footer>
    </div>
  );
}
