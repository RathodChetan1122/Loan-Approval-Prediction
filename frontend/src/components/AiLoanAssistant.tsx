import { useState, useEffect, useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type {
  ChatMessage,
  SuggestedPrompt,
} from "../types/assistant";
import type { LoanApplication } from "../types/loan";
import { sendAssistantMessage, fetchAssistantSuggestions } from "../services/api";

interface AiLoanAssistantProps {
  onBack: () => void;
  onStartAssessment?: () => void;
  onOpenCalculator?: () => void;
  applicationContext?: LoanApplication | null;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome-1",
  role: "assistant",
  content: `👋 **Welcome to the AI Loan Assistant!**\n\nI am your intelligent financial advisor powered by Google AI. I can help you with:\n- **Loan Approval Insights**: How banks assess eligibility, DTI ratios, and approval odds.\n- **CIBIL & Credit Score**: Proven strategies to boost your score to 750+ and fix credit issues.\n- **EMI & Tenure Optimization**: Smart borrowing, prepayment strategies, and interest reduction.\n- **Documentation**: KYC, ITR, and verification requirements for salaried & self-employed borrowers.\n\n*Type your question below or click any of the suggested topics to get started!*`,
  timestamp: Date.now(),
  suggestions: [
    "How can I improve my CIBIL score to 750+?",
    "What are the top reasons for loan rejection?",
    "How do banks calculate maximum loan eligibility?",
    "What documents are needed for salaried loan approval?"
  ]
};

const DEFAULT_CATEGORIZED_PROMPTS: SuggestedPrompt[] = [
  {
    title: "Loan Eligibility Formula",
    prompt: "How do banks calculate my maximum loan eligibility and allowable EMI?",
    category: "Loan Approval Queries",
  },
  {
    title: "Avoid Loan Rejection",
    prompt: "What are the most common reasons for loan rejection and how can I avoid them?",
    category: "Loan Approval Queries",
  },
  {
    title: "Debt-to-Income (DTI) Ratio",
    prompt: "What is Debt-to-Income (DTI) ratio and how does it affect my loan approval odds?",
    category: "Loan Approval Queries",
  },
  {
    title: "Required Loan Documents",
    prompt: "What documents are required for quick salaried and self-employed loan approval?",
    category: "Loan Approval Queries",
  },
  {
    title: "Boost CIBIL Score to 750+",
    prompt: "How can I improve my CIBIL score from 650 to 750+ step-by-step?",
    category: "Credit Score Queries",
  },
  {
    title: "Credit Score Check Myth",
    prompt: "Does checking my own CIBIL score frequently reduce my credit rating?",
    category: "Credit Score Queries",
  },
  {
    title: "Ideal Score for Loans",
    prompt: "What is the minimum credit score required for personal loans vs home loans in India?",
    category: "Credit Score Queries",
  },
  {
    title: "Recover from Late Payments",
    prompt: "How do late EMI or credit card payments affect my credit report and how long does recovery take?",
    category: "Credit Score Queries",
  },
  {
    title: "Tenure vs EMI Optimization",
    prompt: "Should I choose a longer repayment tenure with smaller EMI or a shorter tenure with higher EMI?",
    category: "EMI & Planning",
  },
  {
    title: "Employment Type Impact",
    prompt: "How does employment type (Government, Private, Self-Employed) influence loan approval and interest rates?",
    category: "EMI & Planning",
  }
];

function SparklesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/>
      <path d="M5 3v4"/>
      <path d="M3 5h4"/>
      <path d="M19 17v4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/>
      <path d="M22 2 11 13"/>
    </svg>
  );
}

// Simple markdown formatter helper to render clean structured text without external heavy parser
function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n");
  
  return (
    <div className="chat-markdown-body">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="md-spacer" />;
        }
        
        // Headings
        if (trimmed.startsWith("### ")) {
          return <h3 key={idx} className="md-h3">{trimmed.replace("### ", "")}</h3>;
        }
        if (trimmed.startsWith("#### ")) {
          return <h4 key={idx} className="md-h4">{trimmed.replace("#### ", "")}</h4>;
        }
        if (trimmed.startsWith("## ")) {
          return <h2 key={idx} className="md-h2">{trimmed.replace("## ", "")}</h2>;
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.substring(2);
          return (
            <div key={idx} className="md-bullet-item">
              <span className="md-bullet-dot">•</span>
              <span>{parseInlineStyles(itemText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="md-numbered-item">
              <span className="md-numbered-idx">{numMatch[1]}.</span>
              <span>{parseInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Table row or separator
        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
          if (trimmed.includes("---")) {
            return null; // separator
          }
          const cells = trimmed.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1);
          return (
            <div key={idx} className="md-table-row">
              {cells.map((cell, cIdx) => (
                <span key={cIdx} className="md-table-cell">
                  {parseInlineStyles(cell.trim())}
                </span>
              ))}
            </div>
          );
        }

        return <p key={idx} className="md-p">{parseInlineStyles(trimmed)}</p>;
      })}
    </div>
  );
}

function parseInlineStyles(text: string) {
  // Parse **bold** and *italic* and `code`
  const parts: (string | React.ReactNode)[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Check **bold**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.substring(0, boldMatch.index));
      }
      parts.push(<strong key={`b-${keyIdx++}`}>{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Check `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(remaining.substring(0, codeMatch.index));
      }
      parts.push(<code key={`c-${keyIdx++}`} className="md-inline-code">{codeMatch[1]}</code>);
      remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
      continue;
    }

    // Check *italic*
    const italicMatch = remaining.match(/\*([^*]+)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(remaining.substring(0, italicMatch.index));
      }
      parts.push(<em key={`i-${keyIdx++}`}>{italicMatch[1]}</em>);
      remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
      continue;
    }

    // Append rest
    parts.push(remaining);
    break;
  }

  return parts;
}

export default function AiLoanAssistant({
  onBack,
  onStartAssessment,
  onOpenCalculator,
  applicationContext,
}: AiLoanAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>(DEFAULT_CATEGORIZED_PROMPTS);
  const [categories, setCategories] = useState<string[]>([
    "All",
    "Loan Approval Queries",
    "Credit Score Queries",
    "EMI & Planning",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch dynamic suggestions on load
  useEffect(() => {
    fetchAssistantSuggestions()
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(["All", ...data.categories]);
        }
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestedPrompts(data.suggestions);
        }
      })
      .catch(() => {
        // Use defaults if backend offline
      });
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuery("");
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = newMessages
        .filter((m) => !m.isError && m.id !== "welcome-1")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await sendAssistantMessage({
        message: text,
        history: historyPayload,
        context: applicationContext ? {
          credit_score: applicationContext.credit_score,
          annual_income: applicationContext.annual_income,
          loan_amount: applicationContext.loan_amount,
          loan_tenure: applicationContext.loan_tenure,
          employment_type: applicationContext.employment_type,
          dependents: applicationContext.dependents,
          education: applicationContext.education,
        } : undefined,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: Date.now(),
        suggestions: response.suggestions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "⚠️ **We encountered a temporary connection issue.** Please verify your network or try asking again in a moment.",
        timestamp: Date.now(),
        isError: true,
        suggestions: [
          "How can I improve my CIBIL credit score?",
          "What are common reasons for loan rejection?",
        ]
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const filteredPrompts = selectedCategory === "All"
    ? suggestedPrompts
    : suggestedPrompts.filter((p) => p.category === selectedCategory);

  return (
    <div className="assistant-container">
      {/* Header Bar */}
      <header className="assistant-header-bar">
        <div className="assistant-header-left">
          <button
            type="button"
            className="assistant-back-btn"
            onClick={onBack}
            aria-label="Back to home"
          >
            ← Back
          </button>
          <div className="assistant-title-block">
            <div className="assistant-name-row">
              <span className="assistant-avatar-badge">
                <SparklesIcon />
              </span>
              <h1>AI Loan Assistant</h1>
              <span className="assistant-live-pill">Google AI Powered</span>
            </div>
            <p className="assistant-subtitle">
              Instant personalized guidance on loan approvals, CIBIL credit scores, EMI calculations &amp; eligibility.
            </p>
          </div>
        </div>

        <div className="assistant-header-actions">
          {onStartAssessment && (
            <button
              type="button"
              className="assistant-secondary-action"
              onClick={onStartAssessment}
            >
              Check Eligibility Assessment →
            </button>
          )}
          {onOpenCalculator && (
            <button
              type="button"
              className="assistant-secondary-action-outline"
              onClick={onOpenCalculator}
            >
              ₹ EMI Calculator
            </button>
          )}
          <button
            type="button"
            className="assistant-clear-btn"
            onClick={handleClearChat}
            title="Reset conversation"
          >
            Clear Chat
          </button>
        </div>
      </header>

      {/* Main Chat Viewport */}
      <div className="assistant-chat-viewport">
        <div className="assistant-messages-list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message-row ${msg.role === "user" ? "user-row" : "assistant-row"}`}
            >
              {msg.role === "assistant" && (
                <div className="assistant-bot-avatar" aria-hidden="true">
                  <SparklesIcon />
                </div>
              )}

              <div className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "assistant-bubble"} ${msg.isError ? "error-bubble" : ""}`}>
                <div className="bubble-header">
                  <span className="bubble-sender">
                    {msg.role === "user" ? "You" : "AI Loan Assistant"}
                  </span>
                  {msg.role === "assistant" && (
                    <button
                      type="button"
                      className="copy-bubble-btn"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <CheckIcon /> <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon /> <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="bubble-content">
                  <FormattedContent content={msg.content} />
                </div>

                {/* Inline follow-up suggestions for assistant messages */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="bubble-suggestions">
                    <span className="suggestions-label">Suggested follow-ups:</span>
                    <div className="suggestions-chips-row">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          className="suggestion-chip"
                          onClick={() => handleSendMessage(sug)}
                          disabled={isLoading}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="user-avatar" aria-hidden="true">
                  <span>👤</span>
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Loading State */}
          {isLoading && (
            <div className="chat-message-row assistant-row">
              <div className="assistant-bot-avatar thinking-avatar" aria-hidden="true">
                <SparklesIcon />
              </div>
              <div className="chat-bubble assistant-bubble thinking-bubble">
                <div className="thinking-dots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <span className="thinking-text">LoanWise AI is analyzing your financial query...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Categorized Suggestions Section Below Chat */}
      <section className="assistant-suggestions-panel" aria-label="Suggested loan and credit score queries">
        <div className="suggestions-panel-header">
          <div className="panel-heading-group">
            <span className="panel-tag">POPULAR TOPICS</span>
            <h3>Quick Financial Guidance Queries</h3>
            <p>Click any prompt below to ask the AI assistant immediately:</p>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`category-tab-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Categorized Cards Grid */}
        <div className="prompts-grid">
          {filteredPrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-card"
              onClick={() => handleSendMessage(item.prompt)}
              disabled={isLoading}
            >
              <div className="prompt-card-category">{item.category}</div>
              <strong className="prompt-card-title">{item.title}</strong>
              <p className="prompt-card-text">{item.prompt}</p>
              <span className="prompt-card-cta">Ask AI →</span>
            </button>
          ))}
        </div>
      </section>

      {/* Floating / Pinned Bottom Chat Input Form */}
      <footer className="assistant-input-tray">
        <form className="assistant-input-form" onSubmit={handleFormSubmit}>
          <textarea
            ref={inputRef}
            className="assistant-textarea"
            placeholder="Ask anything about loan eligibility, CIBIL score, EMI, documents, or interest rates... (Press Enter to send)"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="assistant-send-btn"
            disabled={!inputQuery.trim() || isLoading}
            aria-label="Send query"
          >
            <span>Send</span>
            <SendIcon />
          </button>
        </form>
        <div className="input-footer-note">
          <span>AI model provides educational &amp; financial planning guidance. Official approvals depend on bank underwriting.</span>
        </div>
      </footer>
    </div>
  );
}
