"use client";

import { Card, TextField } from "../fields";
import type { Draft } from "../draft";

export function ContactLinks({
  draft,
  update,
}: {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
}) {
  const setPersonal = (field: keyof Draft["personal"]) => (value: string) =>
    update({ personal: { ...draft.personal, [field]: value } });

  return (
    <Card>
      <TextField
        label="Email"
        type="email"
        value={draft.personal.email}
        onChange={setPersonal("email")}
      />
      <TextField
        label="GitHub URL"
        value={draft.personal.github}
        onChange={setPersonal("github")}
      />
      <TextField
        label="LinkedIn URL"
        value={draft.personal.linkedin}
        onChange={setPersonal("linkedin")}
      />
      <TextField
        label="Résumé URL"
        value={draft.personal.resume}
        onChange={setPersonal("resume")}
      />
    </Card>
  );
}
