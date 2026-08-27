"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/portal";
import styles from "./Portal.module.css";

export function LoginForm({ next = "/portal" }: { next?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const update = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Enter an email and password.");
      return;
    }

    setPending(true);
    try {
      await login(form.email, form.password);
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setPending(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBox}>
        <div className={styles.loginBrand}>
          <div className={styles.logo}>
            AJ<span className={styles.logoDot}>.</span>dev
          </div>
          <div className={styles.brandSub}>Content Admin</div>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.loginTitle}>Sign in</div>
          <div className={styles.loginSub}>This area is private.</div>

          <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                type="email"
                autoComplete="username"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={update("password")}
                placeholder="••••••••"
                className={styles.input}
              />
            </label>

            {error && <div className={styles.loginError}>{error}</div>}

            <button type="submit" disabled={pending} className={styles.loginSubmit}>
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <div className={styles.loginBack}>
          <Link href="/">← Back to site</Link>
        </div>
      </div>
    </div>
  );
}
