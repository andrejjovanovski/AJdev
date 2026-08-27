"use client";

import { AddButton, RemoveButton, TextAreaField, TextField } from "../fields";
import { emptyJob, type Draft, type DraftJob } from "../draft";
import styles from "../Portal.module.css";

export function Experience({
  draft,
  update,
}: {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
}) {
  const setJob = (index: number, patch: Partial<DraftJob>) =>
    update({ experience: draft.experience.map((j, i) => (i === index ? { ...j, ...patch } : j)) });

  return (
    <div className={styles.stack}>
      {draft.experience.length === 0 && <div className={styles.empty}>No entries yet.</div>}

      {draft.experience.map((job, index) => (
        <div key={index} className={styles.entry}>
          <div className={styles.grid2}>
            <TextField
              placeholder="Company"
              value={job.company}
              onChange={(company) => setJob(index, { company })}
            />
            <TextField
              placeholder="Role"
              value={job.role}
              onChange={(role) => setJob(index, { role })}
            />
            <TextField
              placeholder="Dates"
              value={job.dates}
              onChange={(dates) => setJob(index, { dates })}
            />
            <TextField
              placeholder="Location"
              value={job.location}
              onChange={(location) => setJob(index, { location })}
            />
          </div>
          <TextAreaField
            placeholder="Description"
            value={job.description}
            onChange={(description) => setJob(index, { description })}
          />
          <TextAreaField
            placeholder="Achievements, one per line"
            rows={3}
            value={job.achievements}
            onChange={(achievements) => setJob(index, { achievements })}
          />
          <TextField
            placeholder="Tech, comma-separated"
            value={job.tech}
            onChange={(tech) => setJob(index, { tech })}
          />
          <RemoveButton
            label="Remove entry"
            align="right"
            onClick={() => update({ experience: draft.experience.filter((_, i) => i !== index) })}
          />
        </div>
      ))}

      <AddButton
        label="Add experience"
        onClick={() => update({ experience: [...draft.experience, emptyJob()] })}
      />
    </div>
  );
}
