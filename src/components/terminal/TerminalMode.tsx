"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RatingWidget } from "@/components/rating/RatingWidget";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { sendContactMessage } from "@/lib/api/actions";
import type { PortfolioContent } from "@/lib/api/content";
import type { AskFaq } from "@/lib/types";
import { createAsk } from "./ask";
import { AskThinking } from "./AskThinking";
import { TerminalOutput } from "./TerminalOutput";
import { useTerminal, type TerminalIO } from "./useTerminal";
import type { Command } from "./types";
import { line } from "./types";
import styles from "./TerminalMode.module.css";

const PROMPT = "andrej@dev ";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ASK_EXIT = new Set(["/cancel", "/exit", "/quit", "/done", "exit", "quit", "bye"]);
/** Delay between streamed lines of an /ask reply. */
const REPLY_LINE_MS = 70;

type ContactStep = "name" | "email" | "message" | "confirm";
type ContactData = { name: string; email: string; message: string };

const emptyContact: ContactData = { name: "", email: "", message: "" };

const BANNER = [
  line("terminal mode — full portfolio, one command line", "accent"),
  line("type /help to see everything you can do, or /exit to go back"),
  line("new: /ask — ask me anything about my work", "faint"),
  line(""),
];

export function TerminalMode({ content, faq }: { content: PortfolioContent; faq: AskFaq[] }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { personal, projects, experience, skills } = content;

  const [step, setStep] = useState<ContactStep | null>(null);
  const contact = useRef<ContactData>({ ...emptyContact });

  const startContactFlow = useCallback((print: TerminalIO["print"]) => {
    contact.current = { ...emptyContact };
    setStep("name");
    print([
      line("Let's get you in touch — I'll ask a few quick questions.", "secondary"),
      line("(type /cancel anytime to stop)", "faint"),
      line(""),
      line("What's your name?", "accent"),
    ]);
  }, []);

  const ask = useMemo(() => createAsk(content, faq), [content, faq]);
  const [asking, setAsking] = useState(false);
  const [replyPhase, setReplyPhase] = useState<"idle" | "thinking" | "typing">("idle");
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => replyTimers.current.forEach(clearTimeout), []);

  /** Fakes a model: "thinks" for 1–2s, then streams the answer in line by line. */
  const reply = useCallback(
    (print: TerminalIO["print"], question: string) => {
      const answer = [...ask(question), line("")];
      const thinkFor = 1000 + Math.random() * 1000;
      const later = (fn: () => void, ms: number) => replyTimers.current.push(setTimeout(fn, ms));

      setReplyPhase("thinking");
      later(() => setReplyPhase("typing"), thinkFor);
      answer.forEach((l, i) => later(() => print([l]), thinkFor + i * REPLY_LINE_MS));
      later(
        () => {
          replyTimers.current = [];
          setReplyPhase("idle");
        },
        thinkFor + answer.length * REPLY_LINE_MS,
      );
    },
    [ask],
  );

  const startAskFlow = useCallback(
    (print: TerminalIO["print"], question: string) => {
      // `/ask what's your stack?` answers once without entering ask mode.
      if (question.trim()) {
        reply(print, question);
        return;
      }
      setAsking(true);
      print([
        line(
          "Ask me anything about my work — projects, stack, experience, how to reach me.",
          "secondary",
        ),
        line("(I'm still learning, so be gentle. type /cancel to go back to commands)", "faint"),
        line(""),
      ]);
    },
    [reply],
  );

  const createCommands = useCallback(
    ({ print, clear }: TerminalIO): Command[] => {
      const openLink =
        (url: string): Command["run"] =>
        () =>
          print([line(url, "accent", url)]);

      return [
        {
          cmd: "help",
          desc: "list available commands",
          run: () =>
            print([
              line("Available commands:", "secondary"),
              line("  /about        — who I am"),
              line("  /projects     — list projects"),
              line("  /project --<slug> — project details, e.g. /project --kumanovo-transit"),
              line("  /experience   — work history"),
              line("  /skills       — tech stack"),
              line("  /ask          — ask me anything (beta)"),
              line("  /contact      — send me a message"),
              line("  /theme        — toggle light/dark"),
              line("  /github       — open github"),
              line("  /linkedin     — open linkedin"),
              line("  /resume       — open resume"),
              line("  /clear        — clear screen"),
              line("  /exit         — back to portfolio"),
            ]),
        },
        {
          cmd: "about",
          desc: "who I am",
          run: () =>
            print([
              line(`${personal.name} — ${personal.role}, ${personal.location}.`, "primary"),
              line(
                "I build complete products end to end — backend systems, APIs, databases and the frontend that ties it together.",
                "secondary",
              ),
            ]),
        },
        {
          cmd: "projects",
          desc: "list projects",
          run: () =>
            print([
              ...projects.map((p) =>
                line(
                  `${p.slug} — ${p.name} — ${p.category}${p.featured ? "  [FEATURED]" : ""}`,
                  "primary",
                ),
              ),
              line("type /project --<slug> for details, e.g. /project --kumanovo-transit", "faint"),
            ]),
        },
        {
          cmd: "project",
          desc: "project details",
          run: (arg) => {
            const slug = arg.replace(/^--/, "").trim();
            const project = projects.find((p) => p.slug === slug);
            if (!project) {
              print([line("usage: /project --<slug> — see /projects for the list", "error")]);
              return;
            }
            print([
              line(project.name, "accent"),
              line(project.description, "secondary"),
              line(`problem:  ${project.problem}`),
              line(`solution: ${project.solution}`),
              line(`stack:    ${project.tech.join(", ")}`),
              line(`live:     ${project.live}`, "accent", project.live),
              line(`github:   ${project.github}`, "accent", project.github),
            ]);
          },
        },
        {
          cmd: "experience",
          desc: "work history",
          run: () =>
            print(
              experience.flatMap((job) => [
                line(`${job.role} @ ${job.company}  (${job.dates})`, "primary"),
                line(`  ${job.description}`),
              ]),
            ),
        },
        {
          cmd: "skills",
          desc: "tech stack",
          run: () =>
            print(
              skills.flatMap((group) => [
                line(`${group.category}:`, "accent"),
                line(`  ${group.items.join(", ")}`, "secondary"),
              ]),
            ),
        },
        { cmd: "ask", desc: "ask me anything", run: (question) => startAskFlow(print, question) },
        { cmd: "contact", desc: "send me a message", run: () => startContactFlow(print) },
        {
          cmd: "theme",
          desc: "toggle light/dark",
          run: () => {
            toggleTheme();
            print([line(`theme switched to ${theme === "light" ? "dark" : "light"}`)]);
          },
        },
        { cmd: "github", desc: "open github", run: openLink(personal.github) },
        { cmd: "linkedin", desc: "open linkedin", run: openLink(personal.linkedin) },
        { cmd: "resume", desc: "open resume", run: openLink(personal.resume) },
        { cmd: "clear", desc: "clear screen", run: () => clear() },
        { cmd: "exit", desc: "back to portfolio", run: () => router.push("/") },
        {
          cmd: "whoami",
          desc: "who is this",
          run: () => print([line(`${personal.name} — ${personal.role}`, "primary")]),
        },
      ];
    },
    [
      personal,
      projects,
      experience,
      skills,
      router,
      theme,
      toggleTheme,
      startContactFlow,
      startAskFlow,
    ],
  );

  const handleContactAnswer = useCallback(
    (raw: string, { print }: TerminalIO) => {
      const value = raw.trim();
      print([line(`${PROMPT}? ${value}`)]);

      if (value.toLowerCase() === "/cancel") {
        contact.current = { ...emptyContact };
        setStep(null);
        print([line("contact flow cancelled.", "error")]);
        return;
      }

      if (step === "name") {
        if (!value) {
          print([line("a name is required — try again:", "error")]);
          return;
        }
        contact.current.name = value;
        setStep("email");
        print([line("What email should I reply to?", "accent")]);
        return;
      }

      if (step === "email") {
        if (!EMAIL_PATTERN.test(value)) {
          print([line("that doesn't look like a valid email — try again:", "error")]);
          return;
        }
        contact.current.email = value;
        setStep("message");
        print([line("What would you like to say?", "accent")]);
        return;
      }

      if (step === "message") {
        if (!value) {
          print([line("message can't be empty — try again:", "error")]);
          return;
        }
        contact.current.message = value;
        setStep("confirm");
        print([
          line(""),
          line("─── review your message ───", "faint"),
          line(`name:    ${contact.current.name}`, "primary"),
          line(`email:   ${contact.current.email}`, "primary"),
          line(`message: ${contact.current.message}`, "primary"),
          line(""),
          line("press enter to send, or /cancel to discard", "faint"),
        ]);
        return;
      }

      if (step === "confirm") {
        if (value && !["y", "yes"].includes(value.toLowerCase())) {
          print([line("press enter to send, or /cancel to discard", "faint")]);
          return;
        }

        const payload = { ...contact.current, source: "terminal" as const };
        setStep(null);
        contact.current = { ...emptyContact };
        print([line("sending...")]);

        sendContactMessage(payload)
          .then(() =>
            print([
              line(
                `✓ message sent — thanks ${payload.name.split(" ")[0]}, I'll get back to you soon.`,
                "success",
              ),
            ]),
          )
          .catch(() =>
            print([line("✗ could not send right now — try again in a moment.", "error")]),
          );
      }
    },
    [step],
  );

  const handleAskAnswer = useCallback(
    (raw: string, { print, clear }: TerminalIO) => {
      const value = raw.trim();
      if (!value) return;
      print([line(`${PROMPT}? ${value}`)]);

      const command = value.toLowerCase();
      if (ASK_EXIT.has(command)) {
        setAsking(false);
        print([line("left ask mode — back to commands (/help to list them).", "faint")]);
        return;
      }
      if (command === "/clear") {
        clear();
        return;
      }
      if (command.startsWith("/")) {
        print([line("you're in ask mode — type /cancel to get back to commands", "error")]);
        return;
      }

      reply(print, value);
    },
    [reply],
  );

  const terminal = useTerminal({
    createCommands,
    prompt: `${PROMPT}❯ `,
    initialLines: BANNER,
    interceptor: step ? handleContactAnswer : asking ? handleAskAnswer : undefined,
  });

  const { focus } = terminal;

  useEffect(() => {
    focus();
  }, [focus]);

  const replying = replyPhase !== "idle";
  const { bodyRef } = terminal;

  // The indicator isn't a printed line, so the auto-scroll in useTerminal misses it.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
    if (!replying) focus();
  }, [replying, bodyRef, focus]);

  return (
    <div className={styles.page}>
      <div className={styles.window}>
        <div className={styles.header}>
          <div className={styles.dots}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
            <span className={styles.label}>terminal-mode — andrej@dev — full screen</span>
          </div>
          <ThemeToggle size={30} />
        </div>

        <div ref={terminal.bodyRef} className={styles.body} onClick={focus}>
          <TerminalOutput lines={terminal.lines} />

          {replyPhase === "thinking" && <AskThinking />}

          <div className={styles.inputRow} style={replying ? { display: "none" } : undefined}>
            <span className={styles.promptUser}>{PROMPT}</span>
            <span className={styles.promptChar}>{step || asking ? "?" : "❯"}</span>
            <input
              ref={terminal.inputRef}
              value={terminal.input}
              onChange={(e) => terminal.setInput(e.target.value)}
              onKeyDown={terminal.handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              className={styles.input}
              aria-label="Terminal input"
            />
          </div>
        </div>
      </div>

      <RatingWidget />
    </div>
  );
}
