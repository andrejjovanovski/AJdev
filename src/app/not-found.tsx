import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className={styles.code}>404</div>
      <div className={styles.message}>Page not found.</div>
      <Link href="/" className={styles.back}>
        ← Back to portfolio
      </Link>
    </div>
  );
}
