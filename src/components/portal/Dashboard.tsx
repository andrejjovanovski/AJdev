"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, saveContent } from "@/lib/api/portal";
import type { PortalContent } from "@/lib/types";
import { fromDraft, toDraft, type Draft } from "./draft";
import { ContactLinks } from "./sections/ContactLinks";
import { Experience } from "./sections/Experience";
import { Profile } from "./sections/Profile";
import { Projects } from "./sections/Projects";
import { Skills } from "./sections/Skills";
import { TerminalSettings } from "./sections/TerminalSettings";
import { ThemeSettings } from "./sections/ThemeSettings";
import styles from "./Portal.module.css";

const SECTIONS = [
  { id: "profile", label: "Profile & Hero" },
  { id: "contact", label: "Contact" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "terminal", label: "Terminal" },
  { id: "theme", label: "Theme" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];
type Status = "idle" | "saving" | "saved" | "error";

export function Dashboard({ content, email }: { content: PortalContent; email: string }) {
  const router = useRouter();
  const [section, setSection] = useState<SectionId>("profile");
  const [draft, setDraft] = useState<Draft>(() => toDraft(content));
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const update = useCallback((patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDirty(true);
    setStatus("idle");
  }, []);

  // Don't lose unsaved edits to a stray navigation or tab close.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    setStatus("saving");
    setError("");
    try {
      const saved = await saveContent(fromDraft(draft));
      // Take the server's normalised copy back (slugs, trimmed values), but
      // leave the expanded case-study panels as the user left them.
      const next = toDraft(saved);
      setDraft((current) => ({
        ...next,
        projects: next.projects.map((project, i) => ({
          ...project,
          expanded: current.projects[i]?.expanded ?? false,
        })),
      }));
      setDirty(false);
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not save changes.");
    }
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      router.replace("/portal/login");
      router.refresh();
    }
  };

  const panel = useMemo(() => {
    switch (section) {
      case "profile":
        return <Profile draft={draft} update={update} />;
      case "contact":
        return <ContactLinks draft={draft} update={update} />;
      case "skills":
        return <Skills draft={draft} update={update} />;
      case "experience":
        return <Experience draft={draft} update={update} />;
      case "projects":
        return <Projects draft={draft} update={update} />;
      case "terminal":
        return <TerminalSettings draft={draft} update={update} />;
      case "theme":
        return <ThemeSettings draft={draft} update={update} />;
    }
  }, [section, draft, update]);

  const activeLabel = SECTIONS.find((s) => s.id === section)?.label ?? "";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            AJ<span className={styles.logoDot}>.</span>dev
          </div>
          <div className={styles.brandSub}>Content Admin</div>
        </div>

        <nav className={styles.nav}>
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${section === item.id ? styles.navItemActive : ""}`}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.brandSub}>{email}</div>
          <Link href="/" className={styles.sidebarLink}>
            ← Back to site
          </Link>
          <button type="button" className={styles.sidebarLink} onClick={signOut}>
            Log out
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.topbarTitle}>{activeLabel}</div>
            <div className={styles.topbarSub}>
              {dirty ? "Unsaved changes" : "All changes saved"}
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={status === "saving" || (!dirty && status !== "error")}
            className={`${styles.saveButton} ${status === "saved" ? styles.saveButtonSaved : ""}`}
          >
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved ✓"}
            {(status === "idle" || status === "error") && "Save changes"}
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.stack}>
            {status === "error" && <div className={styles.errorBanner}>{error}</div>}
            {panel}
          </div>
        </div>
      </div>
    </div>
  );
}
