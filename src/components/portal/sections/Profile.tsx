"use client";

import { AddButton, Card, RemoveButton, TextField } from "../fields";
import { emptyStat, type Draft } from "../draft";
import styles from "../Portal.module.css";

export function Profile({
  draft,
  update,
}: {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
}) {
  const setPersonal = (field: keyof Draft["personal"]) => (value: string) =>
    update({ personal: { ...draft.personal, [field]: value } });

  const setStat = (index: number, field: "value" | "suffix" | "label") => (value: string) =>
    update({
      stats: draft.stats.map((stat, i) => (i === index ? { ...stat, [field]: value } : stat)),
    });

  return (
    <div className={styles.stack}>
      <Card title="Basics">
        <div className={styles.grid2}>
          <TextField label="Full name" value={draft.personal.name} onChange={setPersonal("name")} />
          <TextField
            label="Role / title"
            value={draft.personal.role}
            onChange={setPersonal("role")}
          />
          <TextField
            label="Location"
            value={draft.personal.location}
            onChange={setPersonal("location")}
          />
        </div>
      </Card>

      <Card title="Stats strip">
        <div className={styles.grid4}>
          {draft.stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <TextField
                value={stat.value}
                placeholder="value"
                onChange={setStat(index, "value")}
              />
              <TextField
                value={stat.suffix}
                placeholder="suffix"
                onChange={setStat(index, "suffix")}
              />
              <TextField
                value={stat.label}
                placeholder="label"
                onChange={setStat(index, "label")}
              />
              <RemoveButton
                label="Remove"
                onClick={() => update({ stats: draft.stats.filter((_, i) => i !== index) })}
              />
            </div>
          ))}
        </div>
        <AddButton
          label="Add stat"
          onClick={() => update({ stats: [...draft.stats, emptyStat()] })}
        />
      </Card>
    </div>
  );
}
