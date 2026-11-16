import { NextResponse } from 'next/server';
import { newsService } from "../../../../lib/services/newsService";
import { revalidateNewsContent } from "../../../../lib/revalidatePublicContent";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const isNumericId = !isNaN(slug as any) && !isNaN(parseFloat(slug));

  try {
    const news = isNumericId 
      ? await newsService.getNewsById(slug)
      : await newsService.getNewsBySlug(slug);

    if (!news) {
      return NextResponse.json({ success: false, error: "News not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: news }, { status: 200 });
  } catch (error: any) {
    console.error("NEWS GET ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const isNumericId = !isNaN(slug as any) && !isNaN(parseFloat(slug));

  try {
    const newsItem = isNumericId 
      ? await newsService.getNewsById(slug)
      : await newsService.getNewsBySlug(slug);

    if (!newsItem) {
      return NextResponse.json({ success: false, error: "News not found" }, { status: 404 });
    }
    
    const body = await req.json();
    const updatedNews = await newsService.updateNews(newsItem.id, body);
    revalidateNewsContent([newsItem.slug, updatedNews.slug]);
    return NextResponse.json({ success: true, data: updatedNews }, { status: 200 });
  } catch (error: any) {
    console.error("NEWS UPDATE ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const isNumericId = !isNaN(slug as any) && !isNaN(parseFloat(slug));

  try {
    const newsItem = isNumericId 
      ? await newsService.getNewsById(slug)
      : await newsService.getNewsBySlug(slug);

    if (!newsItem) {
      return NextResponse.json({ success: false, error: "News not found" }, { status: 404 });
    }
    
    await newsService.deleteNews(newsItem.id);
    revalidateNewsContent([newsItem.slug]);
    return NextResponse.json({ success: true, message: "News deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("NEWS DELETE ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
