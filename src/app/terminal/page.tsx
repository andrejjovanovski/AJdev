import type { Metadata } from "next";
import { TerminalMode } from "@/components/terminal/TerminalMode";
import { getPortfolioContent } from "@/lib/api/content";

export const metadata: Metadata = {
  title: "Terminal Mode — Andrej Jovanovski",
  description: "The whole portfolio behind one command line.",
};

export default async function TerminalPage() {
  const content = await getPortfolioContent();

  return <TerminalMode content={content} />;
}
