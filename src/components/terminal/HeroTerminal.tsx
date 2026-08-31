"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scrollToSection } from "@/lib/hooks";
import type { Personal } from "@/lib/types";
import { TerminalOutput } from "./TerminalOutput";
import { useTerminal } from "./useTerminal";
import type { TerminalIO } from "./useTerminal";
import type { Command } from "./types";
import { line } from "./types";
import styles from "./HeroTerminal.module.css";

const INTRO = [
  line("$ whoami", "dim"),
  line("Andrej Jovanovski — Software Engineer", "primary"),
  line(""),
  line("$ status", "dim"),
  line("Building something useful...", "accent"),
  line(""),
  line('# type "/help" to see available commands', "faint"),
];

const SUGGESTIONS = [
  { cmd: "/about", desc: "jump to about" },
  { cmd: "/projects", desc: "jump to projects" },
  { cmd: "/contact", desc: "jump to contact" },
  { cmd: "/github", desc: "open github profile" },
  { cmd: "/skills", desc: "jump to skills" },
  { cmd: "/terminal", desc: "open full terminal mode" },
];

const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "99 little bugs in the code, 99 little bugs... take one down, patch it around, 127 little bugs in the code.",
  "It works on my machine.",
];

const SIZE = { minW: 300, maxW: 760, minH: 220, maxH: 640 };
type Direction = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";
const DIRECTIONS: Direction[] = ["n", "s", "e", "w", "nw", "ne", "sw", "se"];

export function HeroTerminal({ personal }: { personal: Personal }) {
  const router = useRouter();
  const windowRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [suggestion, setSuggestion] = useState(0);
  const [box, setBox] = useState<{
    width?: number;
    height?: number;
    left: number;
    top: number;
  }>({
    left: 0,
    top: 0,
  });

  const createCommands = useCallback(
    ({ print, clear }: TerminalIO): Command[] => {
      const jump =
        (id: string, label: string): Command["run"] =>
        () => {
          scrollToSection(id);
          print([line(`opening ${label}...`, "dim")]);
        };
      const openUrl =
        (url: string, label: string): Command["run"] =>
        () => {
          window.open(url, "_blank", "noreferrer");
          print([line(`opening ${label} ↗`, "secondary")]);
        };

      return [
        {
          cmd: "help",
          desc: "list available commands",
          run: () =>
            print([
              line(
                "Available: /about, /projects, /experience, /skills, /contact, /github, /linkedin, /resume, /terminal, /status, /clear",
                "secondary",
              ),
            ]),
        },
        { cmd: "about", desc: "jump to about", run: jump("about", "about") },
        {
          cmd: "projects",
          desc: "jump to projects",
          run: jump("projects", "projects"),
        },
        {
          cmd: "experience",
          desc: "jump to experience",
          run: jump("experience", "experience"),
        },
        {
          cmd: "skills",
          desc: "jump to skills",
          run: jump("skills", "skills"),
        },
        {
          cmd: "contact",
          desc: "jump to contact",
          run: jump("contact", "contact"),
        },
        {
          cmd: "github",
          desc: "open github profile",
          run: openUrl(personal.github, "github"),
        },
        {
          cmd: "linkedin",
          desc: "open linkedin profile",
          run: openUrl(personal.linkedin, "linkedin"),
        },
        {
          cmd: "resume",
          desc: "open resume",
          run: openUrl(personal.resume, "resume"),
        },
        {
          cmd: "terminal",
          desc: "open full terminal mode",
          run: () => {
            print([line("entering terminal mode...", "dim")]);
            router.push("/terminal");
          },
        },
        {
          cmd: "status",
          desc: "current status",
          run: () => print([line("Building something useful...", "accent")]),
        },
        {
          cmd: "whoami",
          desc: "who is this",
          run: () => print([line(`${personal.name} — ${personal.role}`, "primary")]),
        },
        { cmd: "clear", desc: "clear terminal", run: () => clear() },
        {
          cmd: "sudo",
          desc: "?",
          run: () =>
            print([
              line("Permission denied: nice try.", "error"),
              line("try: /coffee or /joke", "faint"),
            ]),
        },
        {
          cmd: "coffee",
          desc: "brew coffee",
          run: () => print([line("Brewing... done. Productivity +100%", "dim")]),
        },
        {
          cmd: "joke",
          desc: "a bad joke",
          run: () => print([line(JOKES[Math.floor(Math.random() * JOKES.length)], "dim")]),
        },
        {
          cmd: "date",
          desc: "current date",
          run: () => print([line(new Date().toDateString(), "dim")]),
        },
      ];
    },
    [personal, router],
  );

  const terminal = useTerminal({ createCommands, prompt: "$ " });
  const { print, focus } = terminal;

  useEffect(() => {
    const timers = INTRO.map((_, i) => setTimeout(() => print([INTRO[i]]), 140 * (i + 1)));
    const readyTimer = setTimeout(() => setReady(true), 140 * (INTRO.length + 1));
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(readyTimer);
    };
  }, [print]);

  useEffect(() => {
    const id = setInterval(() => setSuggestion((s) => (s + 1) % SUGGESTIONS.length), 7000);
    return () => clearInterval(id);
  }, []);

  const startResize = useCallback(
    (dir: Direction, e: React.MouseEvent) => {
      e.preventDefault();
      const el = windowRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const start = {
        x: e.clientX,
        y: e.clientY,
        w: rect.width,
        h: rect.height,
        left: box.left,
        top: box.top,
      };

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        const next = {
          width: start.w,
          height: start.h,
          left: start.left,
          top: start.top,
        };

        if (dir.includes("e")) next.width = clamp(start.w + dx, SIZE.minW, SIZE.maxW);
        if (dir.includes("s")) next.height = clamp(start.h + dy, SIZE.minH, SIZE.maxH);
        if (dir.includes("w")) {
          next.width = clamp(start.w - dx, SIZE.minW, SIZE.maxW);
          next.left = start.left + (start.w - next.width);
        }
        if (dir.includes("n")) {
          next.height = clamp(start.h - dy, SIZE.minH, SIZE.maxH);
          next.top = start.top + (start.h - next.height);
        }
        setBox(next);
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [box.left, box.top],
  );

  return (
    <div
      ref={windowRef}
      className={styles.window}
      style={{
        width: box.width ? `${box.width}px` : "100%",
        height: box.height ? `${box.height}px` : "auto",
        marginLeft: box.left,
        marginTop: box.top,
      }}
    >
      <div className={styles.header}>
        <span className={styles.dotRed} />
        <span className={styles.dotYellow} />
        <span className={styles.dotGreen} />
        <span className={styles.headerLabel}>zsh — andrej@dev</span>
      </div>

      <div ref={terminal.bodyRef} className={styles.body} onClick={focus}>
        <TerminalOutput lines={terminal.lines} />

        {ready && (
          <>
            <div className={styles.inputRow}>
              <span className={styles.prompt}>$</span>
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
            <div className={styles.suggestion}>
              try <span className={styles.suggestionCmd}>{SUGGESTIONS[suggestion].cmd}</span> —{" "}
              {SUGGESTIONS[suggestion].desc}
            </div>
          </>
        )}
      </div>

      {DIRECTIONS.map((dir) => (
        <div
          key={dir}
          className={`${styles.edge} ${styles[`edge_${dir}`]}`}
          onMouseDown={(e) => startResize(dir, e)}
        />
      ))}
    </div>
  );
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
