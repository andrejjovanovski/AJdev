import { redirect } from "next/navigation";
import { LoginForm } from "@/components/portal/LoginForm";
import { getSession } from "@/lib/server/portal-auth";

export const dynamic = "force-dynamic";

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getSession()) redirect("/portal");

  const { next } = await searchParams;
  // Only same-app paths — never bounce to an attacker-supplied URL.
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/portal";

  return <LoginForm next={target} />;
}
