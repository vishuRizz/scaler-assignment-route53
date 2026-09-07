"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useAmazonQ } from "@/lib/amazon-q/AmazonQContext";
import styles from "./AmazonQSidebar.module.css";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const SUGGESTIONS = [
  {
    title: "How do I add a custom domain to my application?",
    description:
      "Q will generate a step-by-step guide for connecting a custom domain to your application.",
    badge: "Q&A",
    prompt:
      "How do I add a custom domain to my application using Amazon Route 53?",
  },
  {
    title: "List running EC2 instances",
    description:
      "Q will generate a table of EC2 instances that are currently running.",
    badge: "Table",
    prompt: "How do I list running EC2 instances in the AWS console?",
  },
] as const;

function HeaderIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={styles.headerIcon}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * Amazon Q Developer console panel — left sidebar matching AWS Console.
 */
export function AmazonQSidebar() {
  const { setOpen } = useAmazonQ();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setError(null);
    setBusy(false);
    textareaRef.current?.focus();
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed.slice(0, 10000),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/amazon-q/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Amazon Q request failed.");
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.content ?? "",
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Amazon Q request failed.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };

  const hasChat = messages.length > 0;

  return (
    <aside className={styles.panel} aria-label="Amazon Q">
      <div className={styles.accentBar} aria-hidden />

      <header className={styles.header}>
        <h2 className={styles.title}>Amazon Q</h2>
        <div className={styles.headerActions}>
          <HeaderIconButton label="New conversation" onClick={startNewChat}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </HeaderIconButton>
          <HeaderIconButton label="Documentation">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3.5 2.5h6.2L12.5 5.3v8.2H3.5V2.5z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 2.5V5.5H12.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </HeaderIconButton>
          <HeaderIconButton label="History">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M8 5.25V8l2 1.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </HeaderIconButton>
          <HeaderIconButton label="Settings">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M8 2.25v1.3M8 12.45v1.3M2.25 8h1.3M12.45 8h1.3M3.9 3.9l.92.92M11.18 11.18l.92.92M12.1 3.9l-.92.92M4.82 11.18l-.92.92"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </HeaderIconButton>
          <span className={styles.headerDivider} aria-hidden />
          <HeaderIconButton label="Expand">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M9.5 2.5H13.5V6.5M6.5 13.5H2.5V9.5M13.2 2.8L9.2 6.8M2.8 13.2L6.8 9.2"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </HeaderIconButton>
          <HeaderIconButton label="Close Amazon Q" onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 3.5L5.5 8L10 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </HeaderIconButton>
        </div>
      </header>

      <div className={styles.body} ref={listRef}>
        {!hasChat ? (
          <div className={styles.empty}>
            <Image
              src="/assets/amazon-q.svg"
              alt=""
              width={72}
              height={72}
              className={styles.emptyLogo}
              aria-hidden
            />
            <h3 className={styles.greeting}>How can I help you today?</h3>
          </div>
        ) : (
          <div className={styles.messages}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble
                }
              >
                {message.content}
              </div>
            ))}
            {busy ? (
              <div className={styles.assistantBubble}>
                <span className={styles.thinking}>Amazon Q is thinking…</span>
              </div>
            ) : null}
          </div>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </div>

      <div className={styles.composer}>
        <form onSubmit={onSubmit}>
          <div className={styles.inputShell}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Describe what you want to do with AWS, such as &quot;List all S3 buckets&quot;."
              rows={4}
              maxLength={10000}
              disabled={busy}
            />
            <button
              type="submit"
              className={styles.sendButton}
              aria-label="Send"
              disabled={busy || !input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M1.5 8.2L14 2.5l-3.2 11.2-2.4-4.3L1.5 8.2zm7.3 1.1l1.3 2.3 1.7-6.1-3 3.8z" />
              </svg>
            </button>
          </div>
        </form>
        <p className={styles.charHint}>Max 10000 characters</p>

        {!hasChat ? (
          <div className={styles.suggestions}>
            {SUGGESTIONS.map((item) => (
              <button
                key={item.title}
                type="button"
                className={styles.suggestionCard}
                onClick={() => void send(item.prompt)}
                disabled={busy}
              >
                <span className={styles.suggestionTitle}>{item.title}</span>
                <span className={styles.suggestionDesc}>{item.description}</span>
                <span className={styles.suggestionBadge}>{item.badge}</span>
              </button>
            ))}
          </div>
        ) : null}

        <p className={styles.feedback}>
          Help us improve Amazon Q by{" "}
          <a href="#" onClick={(e) => e.preventDefault()}>
            providing feedback.
          </a>
        </p>
      </div>
    </aside>
  );
}
