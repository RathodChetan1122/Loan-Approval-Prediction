import type { ReactNode } from "react";
import InfoTooltip from "./InfoTooltip";

interface QuestionCardProps {
    question: string;
    description: string;
    infoTitle: string;
    infoDescription: string;
    infoRange?: string;
    children: ReactNode;
}

export default function QuestionCard({
    question,
    description,
    infoTitle,
    infoDescription,
    infoRange,
    children,
}: QuestionCardProps) {
    return (
        <section className="question-card question-enter">
            <div className="question-heading">
                <div>
                    <h1>{question}</h1>
                    <p>{description}</p>
                </div>

                <InfoTooltip
                    title={infoTitle}
                    description={infoDescription}
                    range={infoRange}
                />
            </div>

            <div className="question-input-area">
                {children}
            </div>
        </section>
    );
}