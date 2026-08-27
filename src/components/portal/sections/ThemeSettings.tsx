"use client";

import { Card } from "../fields";
import type { Draft } from "../draft";
import styles from "../Portal.module.css";

export function ThemeSettings({
  draft,
  update,
}: {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
}) {
  return (
    <div className={styles.stack}>
      <Card
        title="Default site theme"
        hint="What visitors see before they pick a theme themselves."
      >
        <div className={styles.choiceRow}>
          {(["light", "dark"] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              className={`${styles.choice} ${draft.defaultTheme === theme ? styles.choiceActive : ""}`}
              onClick={() => update({ defaultTheme: theme })}
            >
              {theme === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Accent colors" hint="Reference only — the site palette lives in globals.css.">
        <div className={styles.colorRow}>
          <label className={styles.colorField}>
            <input
              type="color"
              className={styles.colorInput}
              value={draft.accentPrimary}
              onChange={(e) => update({ accentPrimary: e.target.value })}
            />
            Primary (blue)
          </label>
          <label className={styles.colorField}>
            <input
              type="color"
              className={styles.colorInput}
              value={draft.accentSuccess}
              onChange={(e) => update({ accentSuccess: e.target.value })}
            />
            Available badge (green)
          </label>
        </div>
      </Card>
    </div>
  );
}
