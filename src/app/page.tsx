import { Portfolio } from "@/components/portfolio/Portfolio";
import { getPortfolioContent } from "@/lib/api/content";

export default async function HomePage() {
  const content = await getPortfolioContent();

  return <Portfolio content={content} />;
}
