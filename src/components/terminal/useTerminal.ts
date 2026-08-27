"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Command, TerminalLine } from "./types";
import { line } from "./types";

export type TerminalIO = {
  print: (lines: TerminalLine[]) => void;
  clear: () => void;
};

type Options = {
  /** Built with the terminal's own writers; memoize it in the caller. */
  createCommands: (io: TerminalIO) => Command[];
  prompt: string;
  initialLines?: TerminalLine[];
  /** Intercepts input while a multi-step flow (e.g. the contact wizard) is open. */
  interceptor?: (input: string, io: TerminalIO) => void;
};

export function useTerminal({ createCommands, prompt, initialLines, interceptor }: Options) {
  const [lines, setLines] = useState<TerminalLine[]>(initialLines ?? []);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const print = useCallback((newLines: TerminalLine[]) => {
    setLines((current) => [...current, ...newLines]);
  }, []);

  const clear = useCallback(() => setLines([]), []);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  const commands = useMemo(() => createCommands({ print, clear }), [createCommands, print, clear]);

  const commandsRef = useRef(commands);
  commandsRef.current = commands;
  const interceptorRef = useRef(interceptor);
  interceptorRef.current = interceptor;

  const run = useCallback(
    (raw: string) => {
      const value = raw.trim();

      // A bare Enter is meaningful inside a flow (it confirms), but not at the prompt.
      if (interceptorRef.current) {
        if (value) setHistory((current) => [...current, value]);
        setHistoryIndex(-1);
        interceptorRef.current(value, { print, clear });
        return;
      }

      if (!value) return;
      setHistory((current) => [...current, value]);
      setHistoryIndex(-1);

      print([line(`${prompt}${value}`, "dim")]);

      if (!value.startsWith("/")) {
        print([line("commands must start with / — try /help", "error")]);
        return;
      }

      const [name, ...rest] = value.slice(1).toLowerCase().split(" ");
      const command = commandsRef.current.find((c) => c.cmd === name);
      if (command) command.run(rest.join(" "));
      else print([line(`command not found: /${name} — type /help`, "error")]);
    },
    [print, clear, prompt],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        run(input);
        setInput("");
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (!history.length) return;
        e.preventDefault();
        const next =
          e.key === "ArrowUp"
            ? Math.min(historyIndex + 1, history.length - 1)
            : Math.max(historyIndex - 1, -1);
        setHistoryIndex(next);
        setInput(next === -1 ? "" : history[history.length - 1 - next]);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        if (!input.startsWith("/")) return;
        const partial = input.slice(1).toLowerCase();
        const match = commandsRef.current.find((c) => c.cmd.startsWith(partial));
        if (match) setInput(`/${match.cmd}`);
      }
    },
    [history, historyIndex, input, run],
  );

  const focus = useCallback(() => inputRef.current?.focus(), []);

  return {
    lines,
    input,
    setInput,
    commands,
    print,
    clear,
    run,
    handleKeyDown,
    focus,
    bodyRef,
    inputRef,
  };
}
