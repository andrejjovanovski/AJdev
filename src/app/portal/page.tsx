import { redirect } from "next/navigation";
import { Dashboard } from "@/components/portal/Dashboard";
import { getSession } from "@/lib/server/portal-auth";
import { defaultContent, getContent } from "@/lib/server/portal-content";

/** Session-dependent, so never prerendered or cached. */
export const dynamic = "force-dynamic";

export default async function PortalPage() {
  // Middleware already blocked anonymous requests; this is the authoritative check.
  const session = await getSession();
  if (!session) redirect("/portal/login");

  let content;
  try {
    content = await getContent();
  } catch (err) {
    console.error("[portal] loading content failed, starting from defaults", err);
    content = defaultContent();
  }

  return <Dashboard content={content} email={session.email} />;
}
