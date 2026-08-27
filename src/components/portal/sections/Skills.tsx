"use client";

import { AddButton, RemoveButton, TextAreaField, TextField } from "../fields";
import { emptySkillGroup, type Draft, type DraftSkillGroup } from "../draft";
import styles from "../Portal.module.css";

export function Skills({
  draft,
  update,
}: {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
}) {
  const setGroup = (index: number, patch: Partial<DraftSkillGroup>) =>
    update({ skills: draft.skills.map((g, i) => (i === index ? { ...g, ...patch } : g)) });

  return (
    <div className={styles.stack}>
      {draft.skills.length === 0 && <div className={styles.empty}>No categories yet.</div>}

      {draft.skills.map((group, index) => (
        <div key={index} className={styles.entry}>
          <div className={styles.entryHead}>
            <TextField
              value={group.category}
              strong
              placeholder="Category"
              onChange={(category) => setGroup(index, { category })}
            />
            <RemoveButton
              label="Remove"
              onClick={() => update({ skills: draft.skills.filter((_, i) => i !== index) })}
            />
          </div>
          <TextAreaField
            value={group.items}
            placeholder="Comma-separated items"
            onChange={(items) => setGroup(index, { items })}
          />
        </div>
      ))}

      <AddButton
        label="Add category"
        onClick={() => update({ skills: [...draft.skills, emptySkillGroup()] })}
      />
    </div>
  );
}
