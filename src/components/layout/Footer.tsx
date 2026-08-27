import type { Personal } from "@/lib/types";
import styles from "./Footer.module.css";

export function Footer({ personal }: { personal: Personal }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.credit}>
          Designed &amp; built by {personal.name.split(" ")[0]} · {new Date().getFullYear()}
        </div>
        <div className={styles.links}>
          <a href={personal.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${personal.email}`}>Email</a>
        </div>
        <div className={styles.stack}>Built with Next.js + TypeScript</div>
      </div>
    </footer>
  );
}
