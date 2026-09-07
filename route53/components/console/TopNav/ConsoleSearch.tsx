"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  countResults,
  resolveSearchHref,
  searchCatalog,
} from "@/lib/search/query";
import {
  SEARCH_CATEGORIES,
  type SearchCategoryId,
  type SearchItem,
} from "@/lib/search/types";
import { useAmazonQ } from "@/lib/amazon-q/AmazonQContext";
import styles from "./ConsoleSearch.module.css";

const PREVIEW_LIMIT = 3;

const FEATURE_COLORS = [
  "#7aa116",
  "#037f0c",
  "#dd344c",
  "#8c4fff",
  "#0972d3",
  "#e47911",
];

function ServiceIcon() {
  return (
    <span className={styles.serviceIcon} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="5" rx="1" fill="currentColor" />
        <rect x="3" y="10" width="18" height="5" rx="1" fill="currentColor" />
        <rect x="3" y="16" width="18" height="5" rx="1" fill="currentColor" />
      </svg>
    </span>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.6l1.76 3.56 3.93.57-2.84 2.77.67 3.91L8 10.56l-3.52 1.85.67-3.91L2.3 5.73l3.93-.57L8 1.6z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M9.5 2h4.5v4.5h-1.5V4.56L6.78 10.28 5.72 9.22 11.44 3.5H9.5V2zM3 3.5h4V5H4.5v6.5H11V9H12.5v4.5H3V3.5z" />
    </svg>
  );
}

function ThumbsUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M6.5 14h5.2c.55 0 1.03-.35 1.2-.87l1.55-4.65A1.25 1.25 0 0013.25 7H9.2l.55-2.63a1.5 1.5 0 00-2.95-.75L5.2 7.5H2.5A1.5 1.5 0 001 9v3.5A1.5 1.5 0 002.5 14H4v-1H2.5a.5.5 0 01-.5-.5V9a.5.5 0 01.5-.5H5.8l1.8-4.2a.5.5 0 01.98.25L7.7 8H13.25a.25.25 0 01.24.33l-1.55 4.65a.25.25 0 01-.24.17H6.5v.85z" />
    </svg>
  );
}

function ThumbsDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M9.5 2H4.3c-.55 0-1.03.35-1.2.87L1.55 7.52A1.25 1.25 0 002.75 9H6.8l-.55 2.63a1.5 1.5 0 002.95.75L10.8 8.5h2.7A1.5 1.5 0 0015 7V3.5A1.5 1.5 0 0013.5 2H12v1h1.5a.5.5 0 01.5.5V7a.5.5 0 01-.5.5H10.2l-1.8 4.2a.5.5 0 01-.98-.25L8.3 8H2.75a.25.25 0 01-.24-.33l1.55-4.65A.25.25 0 014.3 3h5.2V2.15z" />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 11l3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ConsoleSearchProps = {
  className?: string;
};

export type ConsoleSearchHandle = {
  open: () => void;
};

/**
 * AWS Console unified search — dark results panel powered by search.json.
 */
export const ConsoleSearch = forwardRef<ConsoleSearchHandle, ConsoleSearchProps>(
  function ConsoleSearch({ className }, ref) {
  const router = useRouter();
  const { setOpen: setAmazonQOpen } = useAmazonQ();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<SearchCategoryId>("services");
  const [expanded, setExpanded] = useState<Partial<Record<SearchCategoryId, boolean>>>(
    {},
  );
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const groups = useMemo(() => searchCatalog(query), [query]);
  const total = countResults(groups);

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpen(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
  }));

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.altKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const openResult = (item: SearchItem) => {
    const href = resolveSearchHref(item.href);
    setOpen(false);
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (
      href.startsWith("/hosted-zones") ||
      href.startsWith("/signin") ||
      href === "/"
    ) {
      router.push(href);
      return;
    }
    router.push("/hosted-zones");
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const scrollToCategory = (id: SearchCategoryId) => {
    setActiveCategory(id);
    const el = document.getElementById(`search-section-${id}`);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <div
      className={`${styles.root}${open ? ` ${styles.rootOpen}` : ""}${className ? ` ${className}` : ""}`}
      ref={rootRef}
    >
      <div
        className={`${styles.searchBar}${open ? ` ${styles.searchBarOpen}` : ""}`}
      >
        <span className={styles.searchIcon}>
          <SearchGlyph />
        </span>
        <input
          ref={inputRef}
          className={styles.input}
          type="search"
          placeholder="Search"
          aria-label="Search"
          aria-expanded={open}
          aria-controls={panelId}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setFeedback(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
        />
        {open ? (
          <button
            type="button"
            className={styles.askQ}
            aria-label="Ask Amazon Q"
            onClick={() => {
              setAmazonQOpen(true);
              setOpen(false);
            }}
          >
            <Image
              src="/assets/amazon-q.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
            />
            Ask Amazon Q
          </button>
        ) : (
          <>
            <span className={styles.shortcut}>[Option+S]</span>
            <button
              type="button"
              className={styles.historyButton}
              aria-label="Search history"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2.5 8a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z" />
                <path d="M8 4.25a.75.75 0 01.75.75v2.69l1.78 1.78a.75.75 0 11-1.06 1.06l-2-2A.75.75 0 017.25 8V5A.75.75 0 018 4.25z" />
              </svg>
            </button>
          </>
        )}
        {open ? (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Close search"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
          >
            ×
          </button>
        ) : null}
      </div>

      {open ? (
        <div className={styles.panel} id={panelId} role="dialog" aria-label="Search results">
          <aside className={styles.sidebar}>
            <nav className={styles.categoryList} aria-label="Result categories">
              {SEARCH_CATEGORIES.map(({ id, label }) => {
                const count = groups[id].length;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.categoryItem}${
                      activeCategory === id ? ` ${styles.categoryItemActive}` : ""
                    }`}
                    onClick={() => scrollToCategory(id)}
                  >
                    <span>{label}</span>
                    {query.trim() ? (
                      <span className={styles.categoryCount}>{count}</span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className={styles.feedback}>
              <p className={styles.feedbackLabel}>Were these results helpful?</p>
              <div className={styles.feedbackActions}>
                <button
                  type="button"
                  className={`${styles.feedbackButton}${
                    feedback === "yes" ? ` ${styles.feedbackButtonActive}` : ""
                  }`}
                  onClick={() => setFeedback("yes")}
                >
                  <ThumbsUp /> Yes
                </button>
                <button
                  type="button"
                  className={`${styles.feedbackButton}${
                    feedback === "no" ? ` ${styles.feedbackButtonActive}` : ""
                  }`}
                  onClick={() => setFeedback("no")}
                >
                  <ThumbsDown /> No
                </button>
              </div>
              {feedback ? (
                <p className={styles.feedbackThanks}>Thanks for your feedback.</p>
              ) : null}
            </div>
          </aside>

          <div className={styles.results}>
            {query.trim() && total === 0 ? (
              <p className={styles.empty}>
                No results for &ldquo;{query}&rdquo;. Try a different search.
              </p>
            ) : null}

            {SEARCH_CATEGORIES.map(({ id, label }) => {
              const items = groups[id];
              const isPreviewMode = !query.trim();
              const previewCategories: SearchCategoryId[] = [
                "services",
                "features",
              ];

              if (isPreviewMode && !previewCategories.includes(id)) {
                return null;
              }

              const source = isPreviewMode
                ? items.slice(0, PREVIEW_LIMIT)
                : items;
              if (source.length === 0) return null;

              const showAll = Boolean(expanded[id]);
              const visible =
                !isPreviewMode && !showAll
                  ? source.slice(0, PREVIEW_LIMIT)
                  : source;

              return (
                <section
                  key={id}
                  id={`search-section-${id}`}
                  className={styles.section}
                >
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{label}</h2>
                    {!isPreviewMode && items.length > PREVIEW_LIMIT ? (
                      <button
                        type="button"
                        className={styles.showMore}
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [id]: !prev[id],
                          }))
                        }
                      >
                        {showAll ? "Show less" : "Show more"}
                      </button>
                    ) : null}
                  </div>

                  <div
                    className={
                      id === "services" || id === "features"
                        ? styles.cardStack
                        : styles.linkStack
                    }
                  >
                    {visible.map((item, index) => {
                      if (id === "services") {
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`${styles.serviceCard}${
                              index === 0 ? ` ${styles.serviceCardFocus}` : ""
                            }`}
                            onClick={() => openResult(item)}
                          >
                            <ServiceIcon />
                            <span className={styles.cardBody}>
                              <span className={styles.cardTitle}>
                                {item.title}
                              </span>
                              <span className={styles.cardDesc}>
                                {item.description}
                              </span>
                            </span>
                            <span className={styles.star} aria-hidden>
                              <StarIcon />
                            </span>
                          </button>
                        );
                      }

                      if (id === "features") {
                        const color =
                          FEATURE_COLORS[index % FEATURE_COLORS.length];
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={styles.featureCard}
                            onClick={() => openResult(item)}
                          >
                            <span className={styles.cardTitle}>{item.title}</span>
                            <span className={styles.featureMeta}>
                              <span
                                className={styles.featureSwatch}
                                style={{ background: color }}
                                aria-hidden
                              />
                              <span>{item.service} feature</span>
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={styles.docLink}
                          onClick={() => openResult(item)}
                        >
                          <span>{item.title}</span>
                          <ExternalIcon />
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
  },
);
