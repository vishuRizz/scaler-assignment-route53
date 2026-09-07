"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DEMO_CREDENTIALS, type AuthMethod } from "@/lib/auth/types";
import styles from "./SignInPage.module.css";

type Step = "identify" | "password" | "register";

/**
 * Classic AWS Management Console sign-in (Root user / IAM user).
 * Credentials persist in localStorage until the FastAPI + Aiven backend lands.
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

  const handleRootSignIn = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      signInRoot(email, password);
      goConsole();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    }
  };

  const handleIamSignIn = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      signInIam(accountId, iamUser, password);
      goConsole();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    }
  };

  const handleRegister = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      register({
        email,
        password,
        displayName: displayName || email.split("@")[0],
      });
      goConsole();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    }
  };

  if (!ready || session) {
    return (
      <div className={styles.page}>
        <p style={{ color: "#d5dbdb" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <Image
          src="/assets/aws-logo.svg"
          alt="Amazon Web Services"
          width={103}
          height={48}
          priority
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>

      <div className={styles.card}>
        {step === "register" ? (
          <form onSubmit={handleRegister}>
            <h1 className={styles.title}>Create account</h1>
            <p className={styles.hint}>
              Mock sign-up — saved in this browser&apos;s localStorage (swap for
              Aiven later).
            </p>
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-email">
                Root user email address
              </label>
              <input
                id="reg-email"
                className={styles.input}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <button type="submit" className={styles.primaryButton}>
              Create account and sign in
            </button>
            <hr className={styles.divider} />
            <div className={styles.footerLinks}>
              <button
                type="button"
                onClick={() => {
                  setStep("identify");
                  setError(null);
                  setPassword("");
                }}
              >
                Sign in to an existing account
              </button>
            </div>
          </form>
        ) : null}

        {step === "identify" ? (
          <form
            onSubmit={method === "root" ? handleRootNext : handleIamSignIn}
          >
            <h1 className={styles.title}>Sign in</h1>
            {error ? <p className={styles.error}>{error}</p> : null}

            <div
              className={styles.radioGroup}
              role="radiogroup"
              aria-label="Sign in as"
            >
              <label className={styles.radioRow}>
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
                <span>
                  <strong>Root user</strong>
                  <br />
                  Account owner that performs tasks requiring unrestricted
                  access.{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Learn more
                  </a>
                </span>
              </label>
              <label className={styles.radioRow}>
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
                <span>
                  <strong>IAM user</strong>
                  <br />
                  User within an Account that performs daily tasks.{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Learn more
                  </a>
                </span>
              </label>
            </div>

            {method === "root" ? (
              <>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="root-email">
                    Root user email address
                  </label>
                  <input
                    id="root-email"
                    className={styles.input}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className={styles.hint}>
                  Demo: <code>{DEMO_CREDENTIALS.email}</code> /{" "}
                  <code>{DEMO_CREDENTIALS.password}</code>
                </p>
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
                <p className={styles.hint}>
                  Demo IAM: account <code>{DEMO_CREDENTIALS.accountId}</code>,
                  user <code>{DEMO_CREDENTIALS.displayName}</code>, password{" "}
                  <code>{DEMO_CREDENTIALS.password}</code>
                </p>
                <button type="submit" className={styles.primaryButton}>
                  Sign in
                </button>
              </>
            )}
          </form>
        ) : null}

        {step === "password" ? (
          <form onSubmit={handleRootSignIn}>
            <h1 className={styles.title}>Sign in</h1>
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
            <button type="submit" className={styles.primaryButton}>
              Sign in
            </button>
            <hr className={styles.divider} />
            <div className={styles.footerLinks}>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
          </form>
        ) : null}
      </div>

      {step !== "register" ? (
        <div className={styles.newAccountCard}>
          <p className={styles.newAccountTitle}>New to Amazon Web Services?</p>
          <button
            type="button"
            className={styles.newAccountButton}
            onClick={() => {
              setStep("register");
              setPassword("");
              setError(null);
              setEmail("");
              setDisplayName("");
            }}
          >
            Create a new AWS account
          </button>
        </div>
      ) : null}

      <div className={styles.legal}>
        <div>
          <a href="#">© 2026, Amazon Web Services, Inc. or its affiliates.</a>
        </div>
        <div>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookie preferences</a>
        </div>
      </div>
    </div>
  );
}
