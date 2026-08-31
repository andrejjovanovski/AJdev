import type { Metadata } from "next";
import Link from "next/link";
import { ResumeViewer } from "@/components/resume/ResumeViewer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getPersonal } from "@/lib/api/content";
import styles from "./page.module.css";

const RESUME_FILE = "/AndrejJovanovskiCV.pdf";

export const metadata: Metadata = {
  title: "Resume — Andrej Jovanovski",
  description: "The full CV — experience, stack and what I've shipped.",
};

export default async function ResumePage() {
  const personal = await getPersonal();
  const firstName = personal.name.split(" ")[0];

  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden />

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.back}>
            ← Back to portfolio
          </Link>
          <div className={styles.navLinks}>
            <a href={personal.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={personal.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <ThemeToggle size={30} />
          </div>
        </div>
      </nav>

      <header className={styles.header}>
        <div className={styles.eyebrow}>THE FULL CV</div>
        <h1 className={styles.title}>{firstName}&rsquo;s resume.</h1>
        <p className={styles.lede}>
          The complete rundown — roles, stack and shipped work. Read it inline below, or
          take a copy with you.
        </p>

        <div className={styles.actions}>
          <a className={styles.primary} href={RESUME_FILE} download>
            <span className={styles.dot} />
            Download PDF
          </a>
          <a
            className={styles.secondary}
            href={RESUME_FILE}
            target="_blank"
            rel="noreferrer"
          >
            Open in new tab ↗
          </a>
          <a className={styles.secondary} href={`mailto:${personal.email}`}>
            Email me
          </a>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.viewer}>
          <div className={styles.viewerBar}>
            <span className={styles.lights}>
              <span />
              <span />
              <span />
            </span>
            <span className={styles.filename}>AndrejJovanovskiCV.pdf</span>
          </div>
          <ResumeViewer file={RESUME_FILE} />
        </div>
      </main>

      <footer className={styles.footer}>
        Designed &amp; built by {firstName} · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
