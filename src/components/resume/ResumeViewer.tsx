"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ResumeViewer.module.css";

type Props = {
  /** Path to the PDF, served from /public. */
  file: string;
};

type RenderState = "loading" | "ready" | "error";

/**
 * Renders a PDF straight onto canvases with pdf.js so there's no browser
 * viewer chrome — no toolbar, no sidebar, just the pages in our own frame.
 */
export function ResumeViewer({ file }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RenderState>("loading");

  useEffect(() => {
    let cancelled = false;
    let cleanupResize: (() => void) | undefined;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const doc = await pdfjs.getDocument({ url: file }).promise;
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;

        const pages = await Promise.all(
          Array.from({ length: doc.numPages }, (_, i) => doc.getPage(i + 1)),
        );
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let tasks: { cancel: () => void }[] = [];
        let lastWidth = 0;

        const paint = () => {
          const width = container.clientWidth;
          if (!width || width === lastWidth) return;
          lastWidth = width;

          tasks.forEach((t) => t.cancel());
          tasks = [];
          container.replaceChildren();

          pages.forEach((page) => {
            const base = page.getViewport({ scale: 1 });
            const viewport = page.getViewport({ scale: width / base.width });

            const canvas = document.createElement("canvas");
            canvas.className = styles.page;
            canvas.width = Math.floor(viewport.width * dpr);
            canvas.height = Math.floor(viewport.height * dpr);
            canvas.style.width = "100%";
            canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            container.appendChild(canvas);
            const task = page.render({
              canvasContext: ctx,
              viewport,
              transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
            });
            tasks.push(task);
            task.promise.catch(() => {
              /* cancelled by a resize repaint — ignore */
            });
          });
        };

        paint();
        setState("ready");

        let raf = 0;
        const onResize = () => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(paint);
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(container);
        cleanupResize = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          tasks.forEach((t) => t.cancel());
        };
      } catch (err) {
        console.error("[resume] failed to render PDF", err);
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
      cleanupResize?.();
    };
  }, [file]);

  return (
    <div className={styles.wrap}>
      {state === "loading" && <div className={styles.status}>Loading resume…</div>}
      {state === "error" && (
        <div className={styles.status}>
          Couldn&rsquo;t render the preview.{" "}
          <a href={file} target="_blank" rel="noreferrer">
            Open the PDF ↗
          </a>
        </div>
      )}
      <div
        ref={containerRef}
        className={styles.doc}
        data-visible={state === "ready"}
      />
    </div>
  );
}
