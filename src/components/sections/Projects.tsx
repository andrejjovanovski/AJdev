import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag, TagList } from "@/components/ui/Tag";
import type { Project } from "@/lib/types";
import styles from "./Projects.module.css";

export function Projects({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading eyebrow="01 — SELECTED WORK" title="What I've built." />

        <Reveal>
          {featured.map((project) => (
            <FeaturedCard key={project.slug} project={project} />
          ))}

          <div className={styles.grid}>
            {rest.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>

          <div className={styles.seeAllRow}>
            <Link href="/projects" className={styles.seeAll}>
              See all of my projects →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedCard({ project }: { project: Project }) {
  return (
    <div className={styles.featuredWrap}>
      <div className={styles.featured}>
        <div>
          <div className={styles.featuredThumb}>product screenshot — {project.name}</div>
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <Tag key={tag} variant="accent" size="sm">
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.badge}>FEATURED PROJECT</div>
          <h3 className={styles.featuredTitle}>{project.name}</h3>

          <div className={styles.facts}>
            <Fact label="PROBLEM" value={project.problem} />
            <Fact label="SOLUTION" value={project.solution} />
            <Fact label="MY ROLE" value={project.role} />
            <Fact label="RESULT" value={project.result} />
          </div>

          <div className={styles.techRow}>
            <TagList items={project.tech} />
          </div>

          <div className={styles.links}>
            <a href={project.live} target="_blank" rel="noreferrer" className={styles.primaryLink}>
              View Live
            </a>
            <a href={project.github} target="_blank" rel="noreferrer" className={styles.ghostLink}>
              GitHub
            </a>
            <Link href={`/projects/${project.slug}`} className={styles.caseStudy}>
              Case Study →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardThumb} />
      <div className={styles.category}>{project.category}</div>
      <h3 className={styles.cardTitle}>{project.name}</h3>
      <div className={styles.cardFact}>
        <span className={styles.cardFactLabel}>PROBLEM </span>
        {project.problem}
      </div>
      <div className={styles.cardFactLast}>
        <span className={styles.cardFactLabel}>SOLUTION </span>
        {project.solution}
      </div>
      <div className={styles.cardTech}>
        <TagList items={project.tech} size="sm" />
      </div>
      <div className={styles.cardLinks}>
        <a href={project.live} target="_blank" rel="noreferrer">
          Live
        </a>
        <a href={project.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <Link href={`/projects/${project.slug}`} className={styles.caseStudy}>
          Case Study →
        </Link>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className={styles.factLabel}>{label} </span>
      <span className={styles.factValue}>{value}</span>
    </div>
  );
}
