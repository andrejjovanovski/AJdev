"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { sendContactMessage } from "@/lib/api/actions";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { Personal } from "@/lib/types";
import styles from "./Contact.module.css";

type Status = "idle" | "sending" | "sent" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact({ personal }: { personal: Personal }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [emailTouched, setEmailTouched] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const emailInvalid = emailTouched && form.email.length > 0 && !EMAIL_PATTERN.test(form.email);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: e.target.value }));
      if (field === "email") setEmailTouched(true);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message || !EMAIL_PATTERN.test(form.email)) {
      setEmailTouched(true);
      return;
    }

    setStatus("sending");
    setError("");

    try {
      await sendContactMessage({ ...form, source: "form" });
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      setEmailTouched(false);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.glow} />

      <Reveal>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.eyebrow}>07 — CONTACT</div>
            <h2 className={styles.title}>
              Let&apos;s build
              <br />
              something useful.
            </h2>
            <div className={styles.links}>
              <a href={`mailto:${personal.email}`}>{personal.email}</a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer">
                linkedin
              </a>
              <a href={personal.github} target="_blank" rel="noreferrer">
                github
              </a>
            </div>
          </div>

          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.08)}
          >
            <motion.div variants={fadeUp}>
              <label htmlFor="cf-name" className={styles.label}>
                NAME
              </label>
              <input
                id="cf-name"
                type="text"
                value={form.name}
                onChange={update("name")}
                required
                placeholder="Jane Doe"
                className={styles.input}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="cf-email" className={styles.label}>
                EMAIL
              </label>
              <input
                id="cf-email"
                type="email"
                value={form.email}
                onChange={update("email")}
                required
                placeholder="jane@company.com"
                className={`${styles.input} ${emailInvalid ? styles.invalid : ""}`}
              />
              {emailInvalid && (
                <div className={styles.fieldError}>Enter a valid email address.</div>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="cf-message" className={styles.label}>
                MESSAGE
              </label>
              <textarea
                id="cf-message"
                value={form.message}
                onChange={update("message")}
                required
                rows={5}
                placeholder="Tell me about your project..."
                className={styles.textarea}
              />
            </motion.div>

            {status === "error" && <div className={styles.formError}>{error}</div>}

            <motion.button
              type="submit"
              disabled={status === "sending"}
              className={`${styles.submit} ${status === "sent" ? styles.sent : ""}`}
              variants={fadeUp}
              whileHover={status === "idle" ? { y: -2 } : undefined}
              whileTap={status === "idle" ? { scale: 0.97 } : undefined}
              animate={status === "sent" ? { scale: [1, 1.05, 1] } : undefined}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {status === "sending" && "Sending..."}
              {status === "sent" && "Message Sent ✓"}
              {(status === "idle" || status === "error") && "Send Message →"}
            </motion.button>
          </motion.form>
        </div>
      </Reveal>
    </section>
  );
}
