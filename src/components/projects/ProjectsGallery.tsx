"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tag, TagList } from "@/components/ui/Tag";
import type { Project } from "@/lib/types";
import { ProjectModal } from "./ProjectModal";
import styles from "./ProjectsGallery.module.css";

const ALL = "All";

export function ProjectsGallery({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState(ALL);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
    return [ALL, ...unique];
  }, [projects]);

  const visible = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter],
  );

  const active = projects.find((p) => p.slug === activeSlug) ?? null;

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  return (
    <>
      {categories.length > 2 && (
        <div className={styles.filters}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={`${styles.filter} ${filter === category ? styles.filterActive : ""}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {visible.map((project) => (
          <GalleryCard
            key={project.slug}
            project={project}
            onOpen={() => setActiveSlug(project.slug)}
          />
        ))}
      </div>

      {visible.length === 0 && <p className={styles.empty}>Nothing here yet.</p>}

      <ProjectModal project={active} onClose={() => setActiveSlug(null)} />
    </>
  );
}

function GalleryCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article className={styles.card}>
      <button
        type="button"
        onClick={onOpen}
        className={styles.cardButton}
        aria-label={`Open details for ${project.name}`}
      >
        <div className={styles.thumb}>
          {project.featured && <span className={styles.featuredBadge}>FEATURED</span>}
        </div>

        <div className={styles.category}>{project.category}</div>
        <h2 className={styles.title}>{project.name}</h2>
        <p className={styles.description}>{project.description}</p>

        <div className={styles.tech}>
          <TagList items={project.tech.slice(0, 4)} size="sm" />
          {project.tech.length > 4 && <Tag size="sm">+{project.tech.length - 4}</Tag>}
        </div>

        <span className={styles.viewHint}>View details →</span>
      </button>

      <div className={styles.cardLinks}>
        <a href={project.live} target="_blank" rel="noreferrer">
          Live
        </a>
        <a href={project.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <Link href={`/projects/${project.slug}`}>Case Study →</Link>
      </div>
    </article>
  );
}
