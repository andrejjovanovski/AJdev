import type { PortalContent } from "@/lib/types";
import { request } from "./client";

/** Portal calls always hit this app's own routes — they hold the session cookie. */

export const login = (email: string, password: string) =>
  request<{ ok: true }>("/api/portal/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    local: true,
  });

export const logout = () =>
  request<{ ok: true }>("/api/portal/logout", { method: "POST", local: true });

export const saveContent = (content: PortalContent) =>
  request<PortalContent>("/api/portal/content", {
    method: "PUT",
    body: JSON.stringify(content),
    local: true,
  });
