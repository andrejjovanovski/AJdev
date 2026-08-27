export type Tone = "primary" | "secondary" | "dim" | "faint" | "accent" | "error" | "success";

export type TerminalLine = {
  text: string;
  tone: Tone;
  href?: string;
};

export const toneColor: Record<Tone, string> = {
  primary: "var(--term-primary)",
  secondary: "var(--term-secondary)",
  dim: "var(--term-dim)",
  faint: "var(--term-faint)",
  accent: "var(--term-accent)",
  error: "var(--error)",
  success: "var(--success)",
};

export const line = (text: string, tone: Tone = "dim", href?: string): TerminalLine => ({
  text,
  tone,
  href,
});

export type Command = {
  cmd: string;
  desc: string;
  run: (arg: string) => void;
};
