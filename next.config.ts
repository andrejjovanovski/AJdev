import type { NextConfig } from "next";

/**
 * Project images can live on the backend (AJdevBackendApi) and are served from
 * its origin. Allow that host for next/image when NEXT_PUBLIC_API_URL is set.
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

if (apiUrl) {
  try {
    const { protocol, hostname, port } = new URL(apiUrl);
    remotePatterns.push({
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      ...(port ? { port } : {}),
      pathname: "/**",
    });
  } catch {
    // Malformed NEXT_PUBLIC_API_URL — skip, next/image just won't allow it.
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns },
};

export default nextConfig;
