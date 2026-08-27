import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Tag } from "@/components/ui/Tag";
import { getProject, getProjects } from "@/lib/api/content";
import styles from "./page.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: `${project.name} — Case Study`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const sections = [
    { label: "OVERVIEW", text: project.overview },
    { label: "THE PROBLEM", text: project.problem },
    { label: "THE SOLUTION", text: project.solution },
    { label: "MY ROLE", text: project.role },
    { label: "ARCHITECTURE", text: project.architecture },
    { label: "CHALLENGES", text: project.challenges },
    { label: "RESULT", text: project.result },
    { label: "WHAT I LEARNED", text: project.learned },
  ].filter((section) => section.text);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/#projects" className={styles.back}>
            ← Back to portfolio
          </Link>
          <div className={styles.navLinks}>
            <a href={project.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={project.live} target="_blank" rel="noreferrer">
              Live Site
            </a>
            <ThemeToggle size={30} />
          </div>
        </div>
      </nav>

      <header className={styles.header}>
        <div className={styles.category}>{project.category}</div>
        <h1 className={styles.title}>{project.name}</h1>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.tech}>
          {project.tech.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
      </header>

      <div className={styles.thumbWrap}>
        <div className={styles.thumb}>product screenshot — {project.name}</div>
      </div>

      <article className={styles.body}>
        {sections.map((section) => (
          <section key={section.label}>
            <div className={styles.sectionLabel}>{section.label}</div>
            <p className={styles.sectionText}>{section.text}</p>
          </section>
        ))}

        {project.engineering.length > 0 && (
          <section>
            <div className={styles.sectionLabel}>ENGINEERING DECISIONS</div>
            <div className={styles.decisions}>
              {project.engineering.map((item) => (
                <div key={item} className={styles.decision}>
                  <span className={styles.bullet}>▸</span>
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={styles.footerRow}>
          <Link href="/#projects" className={styles.allProjects}>
            ← All projects
          </Link>
          <div className={styles.actions}>
            <a href={project.live} target="_blank" rel="noreferrer" className={styles.primary}>
              View Live Site
            </a>
            <a href={project.github} target="_blank" rel="noreferrer" className={styles.ghost}>
              View Code
            </a>
          </div>
        </div>
      </article>

      <footer className={styles.footer}>Designed &amp; built by Andrej</footer>
    </div>
  );
}
