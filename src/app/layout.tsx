import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { themeInitScript } from "@/components/theme/theme-script";
import { getPersonal } from "@/lib/api/content";
import { getContent } from "@/lib/server/portal-content";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const personal = await getPersonal();

  return {
    title: `${personal.name} — ${personal.role}`,
    description:
      "Software Engineer building full-stack applications, APIs and digital products — from backend architecture and databases to polished user experiences.",
    openGraph: {
      title: `${personal.name} — ${personal.role}`,
      description: "Full-stack applications, APIs and digital products.",
      type: "website",
    },
  };
}

/** The theme visitors land on when they haven't chosen one — set in /portal. */
async function getDefaultTheme() {
  try {
    return (await getContent()).defaultTheme;
  } catch {
    return "light" as const;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const defaultTheme = await getDefaultTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript(defaultTheme) }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
