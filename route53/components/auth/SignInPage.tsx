"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DEMO_CREDENTIALS, type AuthMethod } from "@/lib/auth/types";
import styles from "./SignInPage.module.css";

type Step = "identify" | "password" | "register";

/**
 * AWS Management Console sign-in — light layout with Lightsail promo panel.
 */
export function SignInPage() {
  const router = useRouter();
  const { session, ready, signInRoot, signInIam, register } = useAuth();

  const [method, setMethod] = useState<AuthMethod>("root");
  const [step, setStep] = useState<Step>("identify");
  const [email, setEmail] = useState<string>(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState("");
  const [accountId, setAccountId] = useState<string>(DEMO_CREDENTIALS.accountId);
  const [iamUser, setIamUser] = useState<string>(DEMO_CREDENTIALS.displayName);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace("/hosted-zones");
    }
  }, [ready, session, router]);

  const goConsole = () => router.replace("/hosted-zones");

  const handleRootNext = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Enter your root user email address.");
      return;
    }
    setStep("password");
  };

  const handleRootSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInRoot(email, password);
      goConsole();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleIamSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInIam(accountId, iamUser, password);
      goConsole();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({
        email,
        password,
        displayName: displayName || email.split("@")[0],
      });
      goConsole();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready || session) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topBarSpacer} />
        <div className={styles.logo}>
          <Image
            src="/assets/aws-logo-dark.svg"
            alt="aws"
            width={72}
            height={44}
            priority
          />
        </div>
        <nav className={styles.utilityLinks} aria-label="Page utilities">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Provide feedback
          </a>
          <button type="button" className={styles.utilityDropdown}>
            Multi-session disabled
            <span className={styles.caret} aria-hidden />
          </button>
          <button type="button" className={styles.utilityDropdown}>
            English
            <span className={styles.caret} aria-hidden />
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.panel}>
          <div className={styles.card}>
            {step === "register" ? (
              <form onSubmit={handleRegister}>
                <h1 className={styles.title}>Create account</h1>
                <p className={styles.subtitle}>
                  Create an account to use this Route 53 console clone.
                </p>
                {error ? <p className={styles.error}>{error}</p> : null}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-email">
                    Email address
                  </label>
                  <input
                    id="reg-email"
                    className={styles.input}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="username@example.com"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-name">
                    Account name
                  </label>
                  <input
                    id="reg-name"
                    className={styles.input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="my-account"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-password">
                    Password
                  </label>
                  <input
                    id="reg-password"
                    className={styles.input}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={busy}
                >
                  {busy ? "Creating…" : "Create account and sign in"}
                </button>
                <div className={styles.orRow}>
                  <span>OR</span>
                </div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setStep("identify");
                    setError(null);
                    setPassword("");
                  }}
                >
                  Sign in to an existing account
                </button>
              </form>
            ) : null}

            {step === "identify" ? (
              <form
                onSubmit={method === "root" ? handleRootNext : handleIamSignIn}
              >
                <h1 className={styles.title}>Sign In</h1>
                <p className={styles.subtitle}>
                  Access your AWS account by user type.
                </p>
                {error ? <p className={styles.error}>{error}</p> : null}

                <p className={styles.userTypeLabel}>
                  User type{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    (not sure?)
                  </a>
                </p>

                <div
                  className={styles.radioGroup}
                  role="radiogroup"
                  aria-label="User type"
                >
                  <label
                    className={`${styles.radioCard}${
                      method === "root" ? ` ${styles.radioCardSelected}` : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="auth-method"
                      checked={method === "root"}
                      onChange={() => {
                        setMethod("root");
                        setError(null);
                        setPassword("");
                      }}
                    />
                    <span className={styles.radioBody}>
                      <strong>Root user</strong>
                      <span className={styles.radioDesc}>
                        Account owner that performs tasks requiring unrestricted
                        access.
                      </span>
                    </span>
                  </label>
                  <label
                    className={`${styles.radioCard}${
                      method === "iam" ? ` ${styles.radioCardSelected}` : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="auth-method"
                      checked={method === "iam"}
                      onChange={() => {
                        setMethod("iam");
                        setError(null);
                        setPassword("");
                      }}
                    />
                    <span className={styles.radioBody}>
                      <strong>IAM user</strong>
                      <span className={styles.radioDesc}>
                        User within an account that performs daily tasks.
                      </span>
                    </span>
                  </label>
                </div>

                {method === "root" ? (
                  <>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="root-email">
                        Email address
                      </label>
                      <input
                        id="root-email"
                        className={styles.input}
                        type="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="username@example.com"
                      />
                    </div>
                    <button type="submit" className={styles.primaryButton}>
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="account-id">
                        Account ID (12 digits) or account alias
                      </label>
                      <input
                        id="account-id"
                        className={styles.input}
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="iam-user">
                        IAM user name
                      </label>
                      <input
                        id="iam-user"
                        className={styles.input}
                        value={iamUser}
                        onChange={(e) => setIamUser(e.target.value)}
                        autoComplete="username"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="iam-password">
                        Password
                      </label>
                      <input
                        id="iam-password"
                        className={styles.input}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={busy}
                    >
                      {busy ? "Signing in…" : "Sign in"}
                    </button>
                  </>
                )}

                <div className={styles.orRow}>
                  <span>OR</span>
                </div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setStep("register");
                    setPassword("");
                    setError(null);
                    setEmail("");
                    setDisplayName("");
                  }}
                >
                  New to AWS? Sign up
                </button>

                <p className={styles.legalInline}>
                  By continuing, you agree to the{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    AWS Customer Agreement
                  </a>
                  ,{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Privacy Notice
                  </a>
                  , and{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Cookie Notice
                  </a>
                  .
                </p>
              </form>
            ) : null}

            {step === "password" ? (
              <form onSubmit={handleRootSignIn}>
                <h1 className={styles.title}>Sign In</h1>
                {error ? <p className={styles.error}>{error}</p> : null}
                <p className={styles.emailSummary}>
                  <strong>{email}</strong>
                  <button
                    type="button"
                    className={styles.changeLink}
                    onClick={() => {
                      setStep("identify");
                      setPassword("");
                      setError(null);
                    }}
                  >
                    Change
                  </button>
                </p>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="root-password">
                    Password
                  </label>
                  <input
                    id="root-password"
                    className={styles.input}
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={busy}
                >
                  {busy ? "Signing in…" : "Sign in"}
                </button>
                <div className={styles.orRow}>
                  <span>OR</span>
                </div>
                <div className={styles.footerLinks}>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Forgot password?
                  </a>
                </div>
              </form>
            ) : null}
          </div>

          <aside className={styles.promo} aria-label="Amazon Lightsail">
            <Image
              src="/signin.png"
              alt="Amazon Lightsail — Lightsail is the easiest way to get started on AWS"
              fill
              sizes="420px"
              className={styles.promoImage}
              priority
            />
          </aside>
        </div>
      </main>

      <footer className={styles.footer}>
        © 2026 Amazon Web Services, Inc. or its affiliates. All rights reserved.
      </footer>
    </div>
  );
}
