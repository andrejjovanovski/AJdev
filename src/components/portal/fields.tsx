"use client";

import styles from "./Portal.module.css";

/** Small building blocks shared by the dashboard sections. */

export function Card({
  title,
  hint,
  children,
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      {title && <div className={styles.cardTitle}>{title}</div>}
      {hint && <div className={styles.cardHint}>{hint}</div>}
      {children}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  strong,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  strong?: boolean;
}) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.input} ${strong ? styles.strong : ""}`}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
  mono,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.textarea} ${mono ? styles.mono : ""}`}
      />
    </label>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.addButton} onClick={onClick}>
      + {label}
    </button>
  );
}

export function RemoveButton({
  label,
  onClick,
  align = "left",
}: {
  label: string;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      className={`${styles.removeButton} ${align === "right" ? styles.removeRight : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
