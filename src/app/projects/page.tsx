import type { Metadata } from "next";
import Link from "next/link";
import { ProjectsGallery } from "@/components/projects/ProjectsGallery";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getPersonal, getProjects } from "@/lib/api/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "All Projects",
  description: "Everything I've designed, built and shipped.",
};

export default async function AllProjectsPage() {
  const [projects, personal] = await Promise.all([getProjects(), getPersonal()]);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/#projects" className={styles.back}>
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
        <div className={styles.eyebrow}>THE FULL ARCHIVE</div>
        <h1 className={styles.title}>All of my projects.</h1>
        <p className={styles.lede}>
          {projects.length} project{projects.length === 1 ? "" : "s"} — click any card for the full
          breakdown of the problem, the build and what came out of it.
        </p>
      </header>

      <main className={styles.content}>
        <ProjectsGallery projects={projects} />
      </main>

      <footer className={styles.footer}>
        Designed &amp; built by {personal.name.split(" ")[0]} · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
