import styles from "./ScrollProgress.module.css";

export function ScrollProgress({ progress }: { progress: number }) {
  return (
    <div className={styles.track}>
      <div className={styles.bar} style={{ width: `${progress}%` }} />
    </div>
  );
}
