import { NextResponse } from 'next/server';
import { newsService } from "../../../lib/services/newsService";
import { revalidateNewsContent } from "../../../lib/revalidatePublicContent";

const parseBoolean = (value: string | null) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const parseLimit = (value: string | null, max = 100) => {
  if (!value) return undefined;
  const limit = Number.parseInt(value, 10);
  if (!Number.isFinite(limit) || limit <= 0) return undefined;
  return Math.min(limit, max);
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, image, imgId, isPublished, publishedAt, category, slug } = body || {};

    if (!title || !content || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, content, and image are required" },
        { status: 400 }
      );
    }

    const news = await newsService.createNews({
      title,
      content,
      image,
      imgid: imgId,
      ispublished: isPublished,
      publishedat: publishedAt,
      category,
      slug
    });

    revalidateNewsContent([news.slug]);

    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error: any) {
    console.error("NEWS POST ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const summary = searchParams.get("summary") === "true";

    if (summary) {
      const count = await newsService.getNewsCount();
      return NextResponse.json({ success: true, count }, { status: 200 });
    }

    const news = await newsService.getAllNews({
      published: parseBoolean(searchParams.get("published")),
      category: searchParams.get("category") || undefined,
      limit: parseLimit(searchParams.get("limit")),
    });

    return NextResponse.json({ success: true, data: news }, { status: 200 });
  } catch (error: any) {
    console.error("NEWS LIST ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
