import { NextResponse } from "next/server";
import { publicationService } from "../../../lib/services/publicationService";
import { revalidatePublicationContent } from "../../../lib/revalidatePublicContent";

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
    const {
      title,
      description,
      issue,
      coverImage,
      coverImgId,
      pdfUrl,
      pdfId,
      isPublished,
      publishedAt,
      slug,
    } = body || {};

    if (!title || !coverImage || !pdfUrl || !pdfId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, cover image, and PDF are required",
        },
        { status: 400 }
      );
    }

    const publication = await publicationService.createPublication({
      title,
      description,
      issue,
      coverimage: coverImage,
      coverimgid: coverImgId,
      pdfurl: pdfUrl,
      pdfid: pdfId,
      ispublished: isPublished,
      publishedat: publishedAt,
      slug,
    });

    revalidatePublicationContent([publication.slug]);

    return NextResponse.json(
      { success: true, data: publication },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("PUBLICATION POST ERROR:", error);
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
      const count = await publicationService.getPublicationCount();
      return NextResponse.json({ success: true, count }, { status: 200 });
    }

    const publications = await publicationService.getAllPublications({
      published: parseBoolean(searchParams.get("published")),
      limit: parseLimit(searchParams.get("limit")),
    });

    return NextResponse.json(
      { success: true, data: publications },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUBLICATION LIST ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
