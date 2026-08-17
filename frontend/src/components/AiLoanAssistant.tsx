import { useState, useEffect, useRef, useMemo } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type {
  ChatMessage,
  SuggestedPrompt,
} from "../types/assistant";
import type { LoanApplication } from "../types/loan";
import { sendAssistantMessage, fetchAssistantSuggestions } from "../services/api";

interface AiLoanAssistantProps {
  onBack: () => void;
  applicationContext?: LoanApplication | null;
}

// Plain, direct greeting — no loan information dump
const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome-1",
  role: "assistant",
  content: `I can help you make sense of credit scores, EMIs, and what affects loan approval. Ask me anything, or pick a topic below to get started.`,
  timestamp: Date.now(),
};

const POPULAR_TOPICS: SuggestedPrompt[] = [
  {
    title: "Loan Eligibility Formula",
    prompt: "How do banks calculate my maximum loan eligibility and allowable EMI?",
    category: "Loan Approval",
  },
  {
    title: "Avoid Rejection Triggers",
    prompt: "What are the most common reasons for loan rejection and how can I avoid them?",
    category: "Loan Approval",
  },
  {
    title: "Debt-to-Income (DTI) Impact",
    prompt: "What is Debt-to-Income (DTI) ratio and how does it affect my approval odds?",
    category: "Loan Approval",
  },
  {
    title: "Required Documents",
    prompt: "What documents are required for quick salaried and self-employed loan approval?",
    category: "Loan Approval",
  },
  {
    title: "Boost CIBIL to 750+",
    prompt: "How can I improve my CIBIL score from 650 to 750+ step-by-step?",
    category: "Credit Score",
  },
  {
    title: "Credit Score Check Myth",
    prompt: "Does checking my own CIBIL score frequently reduce my credit rating?",
    category: "Credit Score",
  },
  {
    title: "Minimum Score for Loans",
    prompt: "What is the minimum credit score required for personal loans vs home loans?",
    category: "Credit Score",
  },
  {
    title: "Recover from Late Payments",
    prompt: "How do late EMI or credit card payments affect my credit report and how long does recovery take?",
    category: "Credit Score",
  },
  {
    title: "Tenure vs EMI Optimization",
    prompt: "Should I choose a longer repayment tenure with smaller EMI or a shorter tenure with higher EMI?",
    category: "EMI & Planning",
  },
  {
    title: "Employment Type Impact",
    prompt: "How does employment type (Government, Private, Self-Employed) influence interest rates?",
    category: "EMI & Planning",
  }
];

const HORIZONTAL_QUICK_SUGGESTIONS = [
  "How to boost CIBIL score to 750+?",
  "Why do loans get rejected?",
  "What is the ideal DTI ratio?",
  "What documents do I need to apply?",
  "How do banks calculate maximum EMI?",
  "Does checking my credit score lower it?",
  "Longer tenure vs higher EMI?",
  "How does employment type affect loans?"
];

function SparklesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/>
      <path d="M22 2 11 13"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  );
}

function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="chat-markdown-body">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="md-spacer" />;
        }

        if (trimmed.startsWith("### ")) {
          return <h3 key={idx} className="md-h3">{trimmed.replace("### ", "")}</h3>;
        }
        if (trimmed.startsWith("#### ")) {
          return <h4 key={idx} className="md-h4">{trimmed.replace("#### ", "")}</h4>;
        }
        if (trimmed.startsWith("## ")) {
          return <h2 key={idx} className="md-h2">{trimmed.replace("## ", "")}</h2>;
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.substring(2);
          return (
            <div key={idx} className="md-bullet-item">
              <span className="md-bullet-dot">•</span>
              <span>{parseInlineStyles(itemText)}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="md-numbered-item">
              <span className="md-numbered-idx">{numMatch[1]}.</span>
              <span>{parseInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
          if (trimmed.includes("---")) {
            return null;
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
  const parts: (string | React.ReactNode)[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.substring(0, boldMatch.index));
      }
      parts.push(<strong key={`b-${keyIdx++}`}>{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      continue;
    }

    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(remaining.substring(0, codeMatch.index));
      }
      parts.push(<code key={`c-${keyIdx++}`} className="md-inline-code">{codeMatch[1]}</code>);
      remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/\*([^*]+)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(remaining.substring(0, italicMatch.index));
      }
      parts.push(<em key={`i-${keyIdx++}`}>{italicMatch[1]}</em>);
      remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
      continue;
    }

    parts.push(remaining);
    break;
  }

  return parts;
}

export default function AiLoanAssistant({
  onBack,
  applicationContext,
}: AiLoanAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputQuery, setInputQuery] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showPopular, setShowPopular] = useState(false);
  const [dynamicPrompts, setDynamicPrompts] = useState<SuggestedPrompt[]>(POPULAR_TOPICS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const quickChipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAssistantSuggestions()
      .then((data) => {
        if (data.suggestions && data.suggestions.length > 0) {
          setDynamicPrompts(data.suggestions);
        }
      })
      .catch(() => {});
  }, []);

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
        content: "Oops! We encountered a slight network hiccup. Please try asking again in a moment.",
        timestamp: Date.now(),
        isError: true,
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

  const handleQuickSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      handleSendMessage(quickSearch);
      setQuickSearch("");
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  // Filtered popular topics based on category and quickSearch
  const filteredPopularTopics = useMemo(() => {
    return dynamicPrompts.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = !quickSearch.trim() ||
        p.title.toLowerCase().includes(quickSearch.toLowerCase()) ||
        p.prompt.toLowerCase().includes(quickSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dynamicPrompts, selectedCategory, quickSearch]);

  const categoriesList = ["All", "Loan Approval", "Credit Score", "EMI & Planning"];

  return (
    <div className="fresh-assistant-container">
      {/* Sleek Minimal Header */}
      <header className="fresh-assistant-header">
        <div className="header-brand-side">
          <button
            type="button"
            className="fresh-back-btn"
            onClick={onBack}
            aria-label="Back to home"
          >
            ← Back
          </button>
          <div className="fresh-title-badge">
            <span className="fresh-spark-icon">
              <SparklesIcon />
            </span>
            <h2>AI Loan Assistant</h2>
          </div>
        </div>

        {/* Quick Search Option Beside Title */}
        <form className="fresh-quick-search" onSubmit={handleQuickSearchSubmit}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Quick search topic or ask..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
          />
          {quickSearch && (
            <button
              type="button"
              className="quick-search-clear"
              onClick={() => setQuickSearch("")}
            >
              ✕
            </button>
          )}
        </form>

        <div className="header-tools-side">
          <button
            type="button"
            className={`popular-toggle-btn ${showPopular ? "active" : ""}`}
            onClick={() => setShowPopular(!showPopular)}
            title="Toggle Popular Topics"
          >
            Popular Topics
          </button>
          <button
            type="button"
            className="fresh-clear-btn"
            onClick={handleClearChat}
            title="Reset conversation"
          >
            <TrashIcon />
            <span>Clear</span>
          </button>
        </div>
      </header>

      {/* Main Chat Stream Viewport */}
      <div className="fresh-chat-viewport">
        <div className="fresh-messages-stream">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`fresh-msg-row ${msg.role === "user" ? "msg-user" : "msg-assistant"}`}
            >
              {msg.role === "assistant" && (
                <div className="fresh-avatar-bot" aria-hidden="true">
                  <SparklesIcon />
                </div>
              )}

              <div className={`fresh-bubble ${msg.role === "user" ? "bubble-user" : "bubble-bot"} ${msg.isError ? "bubble-error" : ""}`}>
                <div className="fresh-bubble-top">
                  <span className="fresh-sender-name">
                    {msg.role === "user" ? "You" : "Loan Assistant"}
                  </span>
                  {msg.role === "assistant" && (
                    <button
                      type="button"
                      className="fresh-copy-btn"
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

                <div className="fresh-bubble-text">
                  <FormattedContent content={msg.content} />
                </div>
              </div>

              {msg.role === "user" && (
                <div className="fresh-avatar-user" aria-hidden="true">
                  👤
                </div>
              )}
            </div>
          ))}

          {/* Clean Typing Indicator */}
          {isLoading && (
            <div className="fresh-msg-row msg-assistant">
              <div className="fresh-avatar-bot pulse-sparkle" aria-hidden="true">
                <SparklesIcon />
              </div>
              <div className="fresh-bubble bubble-bot fresh-thinking-state">
                <div className="fresh-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="fresh-thinking-label">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Horizontal Scrollable Suggested Topics Strip directly above input */}
      <div className="fresh-horizontal-suggestions-wrapper">
        <div className="suggestions-scroll-container" ref={quickChipsRef}>
          {HORIZONTAL_QUICK_SUGGESTIONS.map((topic, tIdx) => (
            <button
              key={tIdx}
              type="button"
              className="fresh-topic-chip"
              onClick={() => handleSendMessage(topic)}
              disabled={isLoading}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Bottom Search / Query Input Bar */}
      <footer className="fresh-input-bar">
        <form className="fresh-form" onSubmit={handleFormSubmit}>
          <textarea
            ref={inputRef}
            className="fresh-textarea"
            placeholder="Type your question here... (Enter to send, Shift+Enter for new line)"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="fresh-send-btn"
            disabled={!inputQuery.trim() || isLoading}
            aria-label="Send message"
          >
            <span>Ask</span>
            <SendIcon />
          </button>
        </form>
      </footer>

      {/* Clean & Fresh "Popular Topics" Section at the bottom */}
      {showPopular && (
        <section className="fresh-popular-section" aria-label="Popular financial topics">
          <div className="popular-header-row">
            <div className="popular-title-wrap">
              <span className="popular-kicker">DISCOVER</span>
              <h3>Popular Topics</h3>
            </div>

            <div className="popular-header-controls">
              {/* Category Filter Tabs */}
              <div className="popular-tabs" role="tablist">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === cat}
                    className={`popular-tab-chip ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="popular-close-btn"
                onClick={() => setShowPopular(false)}
                title="Hide popular topics"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Clean Grid of Cards */}
          <div className="popular-cards-grid">
            {filteredPopularTopics.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="popular-card"
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
              >
                <div className="popular-card-category">{item.category}</div>
                <strong className="popular-card-heading">{item.title}</strong>
                <p className="popular-card-desc">{item.prompt}</p>
                <span className="popular-card-action">Ask</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
