import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/session";

/**
 * Gate for /portal. The pages check the session again on the server — this is
 * the cheap first line so an unauthenticated request never renders the app.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = pathname === "/portal/login";

  if (session && isLogin) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  if (!session && !isLogin) {
    const login = new URL("/portal/login", request.url);
    if (pathname !== "/portal") login.searchParams.set("next", `${pathname}${search}`);

    const response = NextResponse.redirect(login);
    // Clear an expired or tampered cookie so the login page starts clean.
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal", "/portal/:path*"],
};
