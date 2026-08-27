"use client";

import { AddButton, RemoveButton, TextAreaField, TextField } from "../fields";
import { emptyProject, type Draft, type DraftProject } from "../draft";
import styles from "../Portal.module.css";

/** Case-study fields, hidden until the entry is expanded. */
const CASE_STUDY: { key: keyof DraftProject; placeholder: string; rows?: number }[] = [
  { key: "overview", placeholder: "Overview" },
  { key: "problem", placeholder: "Problem" },
  { key: "solution", placeholder: "Solution" },
  { key: "role", placeholder: "Your role" },
  { key: "engineering", placeholder: "Engineering highlights, one per line", rows: 3 },
  { key: "result", placeholder: "Result" },
  { key: "architecture", placeholder: "Architecture" },
  { key: "challenges", placeholder: "Challenges" },
  { key: "learned", placeholder: "What you learned" },
];

export function Projects({
  draft,
  update,
}: {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
}) {
  const setProject = (index: number, patch: Partial<DraftProject>) =>
    update({ projects: draft.projects.map((p, i) => (i === index ? { ...p, ...patch } : p)) });

  return (
    <div className={styles.stack}>
      {draft.projects.length === 0 && <div className={styles.empty}>No projects yet.</div>}

      {draft.projects.map((project, index) => (
        <div key={index} className={styles.entry}>
          <div className={styles.entryHead}>
            <TextField
              strong
              placeholder="Project name"
              value={project.name}
              onChange={(name) => setProject(index, { name })}
            />
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={project.featured}
                onChange={(e) => setProject(index, { featured: e.target.checked })}
              />
              Featured
            </label>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setProject(index, { expanded: !project.expanded })}
            >
              {project.expanded ? "Collapse" : "Case study »"}
            </button>
          </div>

          <div className={styles.grid2}>
            <TextField
              placeholder="Category"
              value={project.category}
              onChange={(category) => setProject(index, { category })}
            />
            <TextField
              placeholder="Slug"
              value={project.slug}
              onChange={(slug) => setProject(index, { slug })}
            />
          </div>

          <TextAreaField
            placeholder="Description"
            value={project.description}
            onChange={(description) => setProject(index, { description })}
          />

          <div className={styles.grid2}>
            <TextField
              placeholder="Tags, comma-separated"
              value={project.tags}
              onChange={(tags) => setProject(index, { tags })}
            />
            <TextField
              placeholder="Tech, comma-separated"
              value={project.tech}
              onChange={(tech) => setProject(index, { tech })}
            />
            <TextField
              placeholder="Live URL"
              value={project.live}
              onChange={(live) => setProject(index, { live })}
            />
            <TextField
              placeholder="GitHub URL"
              value={project.github}
              onChange={(github) => setProject(index, { github })}
            />
          </div>

          {project.expanded && (
            <div className={styles.caseStudy}>
              <div className={styles.caseStudyTitle}>Case study</div>
              {CASE_STUDY.map(({ key, placeholder, rows }) => (
                <TextAreaField
                  key={key}
                  placeholder={placeholder}
                  rows={rows}
                  value={String(project[key] ?? "")}
                  onChange={(value) => setProject(index, { [key]: value })}
                />
              ))}
            </div>
          )}

          <RemoveButton
            label="Remove project"
            align="right"
            onClick={() => update({ projects: draft.projects.filter((_, i) => i !== index) })}
          />
        </div>
      ))}

      <AddButton
        label="Add project"
        onClick={() => update({ projects: [...draft.projects, emptyProject()] })}
      />
    </div>
  );
}
