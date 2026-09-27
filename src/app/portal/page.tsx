import { redirect } from "next/navigation";
import { Dashboard } from "@/components/portal/Dashboard";
import { getSession } from "@/lib/server/portal-auth";
import { PortalAuthError } from "@/lib/server/portal-backend";
import { getContent } from "@/lib/server/portal-content";
import styles from "./page-error.module.css";

/** Session-dependent, so never prerendered or cached. */
export const dynamic = "force-dynamic";

export default async function PortalPage() {
  // Middleware already blocked anonymous requests; this is the authoritative check.
  const session = await getSession();
  if (!session) redirect("/portal/login");

  try {
    const content = await getContent(session);
    return <Dashboard content={content} email={session.email} />;
  } catch (err) {
    if (err instanceof PortalAuthError) redirect("/portal/login");
    console.error("[portal] loading content failed", err);
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.title}>Content unavailable</h1>
          <p className={styles.body}>
            The portal could not reach the backend. Make sure the AJdevBackendApi is
            running, then reload this page.
          </p>
        </div>
      </div>
    );
  }
}
