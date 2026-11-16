import { unstable_cache } from "next/cache";
import prisma from "../utils/prisma";
import { getPool } from "../utils/db";

const REVALIDATE_SECONDS = 3600;

const serializeNews = (item: any) => ({
  ...item,
  createdat: item.createdat ? new Date(item.createdat).toISOString() : null,
  publishedat: item.publishedat ? new Date(item.publishedat).toISOString() : null,
});

const serializePoster = (item: any) => ({
  ...item,
  timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : null,
});

const serializePublication = (item: any) => ({
  ...item,
  createdat: item.createdat ? new Date(item.createdat).toISOString() : null,
  publishedat: item.publishedat ? new Date(item.publishedat).toISOString() : null,
});

export const getPublishedNews = unstable_cache(
  async () => {
    const news = await prisma.news.findMany({
      where: { ispublished: true },
      orderBy: [{ publishedat: "desc" }, { createdat: "desc" }],
    });

    return news.map(serializeNews);
  },
  ["public-news-list"],
  { revalidate: REVALIDATE_SECONDS, tags: ["news", "news:list"] }
);

export const getLatestPublishedNews = unstable_cache(
  async (limit = 3) => {
    const news = await prisma.news.findMany({
      where: { ispublished: true },
      orderBy: [{ publishedat: "desc" }, { createdat: "desc" }],
      take: limit,
    });

    return news.map(serializeNews);
  },
  ["public-news-latest"],
  { revalidate: REVALIDATE_SECONDS, tags: ["news", "news:list"] }
);

export const getNewsBySlug = async (slug: string) => {
  const getCachedNews = unstable_cache(
    async () => {
      const news = await prisma.news.findUnique({
        where: { slug },
      });

      if (!news || !news.ispublished) return null;
      return serializeNews(news);
    },
    ["public-news-detail", slug],
    { revalidate: REVALIDATE_SECONDS, tags: ["news", `news:${slug}`] }
  );

  return getCachedNews();
};

export const getLatestNewsSlugs = unstable_cache(
  async (limit = 50) => {
    const news = await prisma.news.findMany({
      where: { ispublished: true },
      orderBy: [{ publishedat: "desc" }, { createdat: "desc" }],
      take: limit,
      select: { slug: true },
    });

    return news;
  },
  ["public-news-static-slugs"],
  { revalidate: REVALIDATE_SECONDS, tags: ["news", "news:list"] }
);

export const getLatestPosters = unstable_cache(
  async (limit = 5) => {
    const pool = getPool();
    const result = await pool.query(
      "SELECT id, image, imgid, timestamp FROM images ORDER BY id DESC LIMIT $1",
      [limit]
    );

    return result.rows.map(serializePoster);
  },
  ["public-posters-latest"],
  { revalidate: REVALIDATE_SECONDS, tags: ["posters"] }
);

export const getPublishedPublications = unstable_cache(
  async () => {
    const publications = await prisma.publication.findMany({
      where: { ispublished: true },
      orderBy: [{ publishedat: "desc" }, { createdat: "desc" }],
    });

    return publications.map(serializePublication);
  },
  ["public-publication-list"],
  { revalidate: REVALIDATE_SECONDS, tags: ["publications", "publications:list"] }
);

export const getPublicationBySlug = async (slug: string) => {
  const getCachedPublication = unstable_cache(
    async () => {
      const publication = await prisma.publication.findUnique({
        where: { slug },
      });

      if (!publication || !publication.ispublished) return null;
      return serializePublication(publication);
    },
    ["public-publication-detail", slug],
    { revalidate: REVALIDATE_SECONDS, tags: ["publications", `publication:${slug}`] }
  );

  return getCachedPublication();
};
