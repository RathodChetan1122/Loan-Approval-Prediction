interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressBar({
    currentStep,
    totalSteps,
}: ProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="progress-container">
            <div className="progress-meta">
                <span>Loan application</span>
                <span>
                    {currentStep} of {totalSteps}
                </span>
            </div>

            <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={totalSteps}
            >
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}