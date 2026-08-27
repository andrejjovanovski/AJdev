"use client";

import { Card, TextAreaField } from "../fields";
import type { Draft } from "../draft";
import styles from "../Portal.module.css";

/** Mirrors the command list in `components/terminal/TerminalMode.tsx`. */
const COMMANDS = [
  { name: "/help", desc: "list commands" },
  { name: "/about", desc: "who I am" },
  { name: "/projects", desc: "list projects" },
  { name: "/project --<slug>", desc: "project details" },
  { name: "/experience", desc: "work history" },
  { name: "/skills", desc: "tech stack" },
  { name: "/contact", desc: "send a message" },
  { name: "/theme", desc: "toggle light/dark" },
  { name: "/github", desc: "open github" },
  { name: "/linkedin", desc: "open linkedin" },
  { name: "/resume", desc: "open résumé" },
  { name: "/whoami", desc: "current visitor" },
  { name: "/clear", desc: "clear screen" },
  { name: "/exit", desc: "back to portfolio" },
];

export function TerminalSettings({
  draft,
  update,
}: {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
}) {
  return (
    <div className={styles.stack}>
      <Card title="/about response" hint="Shown when someone types /about in terminal mode.">
        <TextAreaField
          mono
          rows={3}
          value={draft.terminalAbout}
          onChange={(terminalAbout) => update({ terminalAbout })}
        />
      </Card>

      <Card title="Available commands" hint="Reference — defined in the terminal component.">
        <div className={styles.commandList}>
          {COMMANDS.map((command) => (
            <div key={command.name}>
              <span className={styles.commandName}>{command.name}</span>
              <span className={styles.commandDesc}> — {command.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
