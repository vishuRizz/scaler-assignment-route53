"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./LandingPage.module.css";

const BENEFITS = [
  {
    id: "reliable",
    title:
      "Route end users to your site reliably with globally-dispersed Domain Name System (DNS) servers and automatic scaling.",
    body: "Amazon Route 53 ensures reliable and efficient routing of end users to your website by leveraging globally-dispersed Domain Name System (DNS) servers. With automatic scaling, the service dynamically adjusts to varying workloads, optimizing performance and maintaining a seamless user experience.",
  },
  {
    id: "setup",
    title:
      "Set up your DNS routing in minutes with domain name registration and straightforward visual traffic flow tools.",
    body: "Amazon Route 53 streamlines the setup of DNS routing by providing quick and easy domain name registration, complemented by straightforward visual traffic flow tools. This enables users to configure their DNS settings within minutes, simplifying the process of managing and directing web traffic efficiently.",
  },
  {
    id: "policies",
    title:
      "Customize your DNS routing policies to reduce latency, improve application availability, and maintain compliance.",
    body: "Amazon Route 53 allows users to tailor DNS routing policies to specific needs, such as reducing latency, enhancing application availability, and ensuring compliance. This customization empowers users to optimize their DNS configurations for performance, resilience, and adherence to regulatory requirements.",
  },
] as const;

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2 8h12M8 2c1.8 1.8 2.7 3.8 2.7 6S9.8 12.2 8 14C6.2 12.2 5.3 10.2 5.3 8S6.2 3.8 8 2z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.5 10.5L13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4.5 14.2c1.1-1.8 2.7-2.7 4.5-2.7s3.4.9 4.5 2.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * AWS marketing-style Amazon Route 53 product landing page.
 */
export function LandingPage() {
  const [openBenefit, setOpenBenefit] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>

      {/* Top utility bar */}
      <header className={styles.utilityBar}>
        <div className={styles.utilityInner}>
          <button type="button" className={styles.utilityLang}>
            <GlobeIcon />
            <span>English</span>
            <ChevronDown />
          </button>
          <nav className={styles.utilityLinks} aria-label="Utility">
            <a href="#">Contact us</a>
            <a href="#">AWS Marketplace</a>
            <button type="button" className={styles.utilityMenuBtn}>
              Support <ChevronDown />
            </button>
            <button type="button" className={styles.utilityMenuBtn}>
              My account <ChevronDown />
            </button>
            <button
              type="button"
              className={styles.utilityUser}
              aria-label="Account"
            >
              <UserIcon />
            </button>
          </nav>
        </div>
      </header>

      {/* Main AWS nav */}
      <div className={styles.mainNav}>
        <div className={styles.mainNavInner}>
          <div className={styles.mainNavLeft}>
            <Link href="/" className={styles.logoLink} aria-label="Amazon Web Services">
              <Image
                src="/assets/aws-logo-dark.svg"
                alt="AWS"
                width={49}
                height={27}
                priority
              />
            </Link>
            <nav className={styles.mainLinks} aria-label="Primary">
              <a href="#">re:Invent</a>
              <a href="#">Discover AWS</a>
              <a href="#">Products</a>
              <a href="#">Solutions</a>
              <a href="#">Pricing</a>
              <a href="#">Resources</a>
            </nav>
          </div>
          <div className={styles.mainNavRight}>
            <button type="button" className={styles.searchBtn}>
              <SearchIcon />
              <span>Search</span>
            </button>
            <Link href="/signin" className={styles.signInLink}>
              Sign in to console
            </Link>
            <Link href="/signin" className={styles.createAccountBtn}>
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Product subnav (floating) */}
      <div className={styles.productNavWrap}>
        <div className={styles.productNav}>
          <span className={styles.productName}>Amazon Route 53</span>
          <nav className={styles.productLinks} aria-label="Route 53">
            <a href="#overview" className={styles.productLinkActive}>
              Overview
            </a>
            <button type="button" className={styles.productLinkBtn}>
              Features <ChevronDown />
            </button>
            <a href="#">Pricing</a>
            <a href="#">Resources</a>
            <a href="#">FAQs</a>
          </nav>
        </div>
      </div>

      <main id="main">
        {/* Hero */}
        <section className={styles.hero} id="overview" aria-labelledby="hero-title">
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                <a href="#">Products</a>
                <span className={styles.bcSep} aria-hidden>
                  ›
                </span>
                <a href="#">Networking and Content Delivery</a>
                <span className={styles.bcSep} aria-hidden>
                  ›
                </span>
                <span>Amazon Route 53</span>
              </nav>

              <h1 id="hero-title" className={styles.heroTitle}>
                Amazon Route 53 - DNS service
              </h1>
              <p className={styles.heroSubtitle}>
                A reliable and cost-effective way to route end users to Internet
                applications
              </p>
              <div className={styles.heroCtas}>
                <Link href="/signin" className={styles.ctaPrimary}>
                  Get started with Route 53
                </Link>
                <a href="#" className={styles.ctaSecondary}>
                  Connect with an expert
                </a>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.starFab}
            aria-label="Save to favorites"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M9 2.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L9 11.5l-3.52 1.84.67-3.92L3.3 6.64l3.94-.57L9 2.5z"
                stroke="#232F3E"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </section>

        {/* Benefits */}
        <section className={styles.benefits} aria-labelledby="benefits-title">
          <div className={styles.benefitsInner}>
            <h2 id="benefits-title" className={styles.benefitsTitle}>
              Benefits of Route 53
            </h2>
            <div className={styles.accordion}>
              {BENEFITS.map((item) => {
                const open = openBenefit === item.id;
                return (
                  <div key={item.id} className={styles.accordionItem}>
                    <button
                      type="button"
                      className={styles.accordionTrigger}
                      aria-expanded={open}
                      onClick={() =>
                        setOpenBenefit(open ? null : item.id)
                      }
                    >
                      <span className={styles.accordionTitle}>{item.title}</span>
                      <span className={styles.accordionIcon} aria-hidden>
                        {open ? "−" : "+"}
                      </span>
                    </button>
                    {open ? (
                      <div className={styles.accordionPanel}>
                        <p>{item.body}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Floating widgets */}
      <div className={styles.floatWidgets}>
        <button type="button" className={styles.floatToggle} aria-label="Preferences">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <rect
              x="2"
              y="3.5"
              width="14"
              height="3"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="6.5" cy="5" r="1.4" fill="currentColor" />
            <rect
              x="2"
              y="11.5"
              width="14"
              height="3"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="11.5" cy="13" r="1.4" fill="currentColor" />
          </svg>
        </button>
        <button type="button" className={styles.floatChat} aria-label="Chat">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M3.5 4.5h13a1 1 0 011 1v7a1 1 0 01-1 1H8l-3.5 3v-3h-1a1 1 0 01-1-1v-7a1 1 0 011-1z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
