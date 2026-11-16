import { notFound } from "next/navigation";
import NewsDetailClient from "../../../components/NewsDetailClient";
import {
  getLatestNewsSlugs,
  getLatestPosters,
  getLatestPublishedNews,
  getNewsBySlug,
} from "../../../lib/publicContent";

export const revalidate = 3600;
export const dynamicParams = true;

interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  let slugs: Awaited<ReturnType<typeof getLatestNewsSlugs>> = [];

  try {
    slugs = await getLatestNewsSlugs(50);
  } catch (error) {
    console.error("Failed to generate news static params:", error);
  }

  return slugs
    .filter((item) => item.slug)
    .map((item) => ({
      slug: item.slug,
    }));
}

const NewsDetailPage = async ({ params }: NewsDetailPageProps) => {
  const slug = decodeURIComponent(params.slug);
  const [news, newsItems, posters] = await Promise.all([
    getNewsBySlug(slug),
    getLatestPublishedNews(6),
    getLatestPosters(5),
  ]);

  if (!news) {
    notFound();
  }

  return (
    <NewsDetailClient
      news={news}
      newsItems={newsItems}
      posters={posters}
    />
  );
};

export default NewsDetailPage;
