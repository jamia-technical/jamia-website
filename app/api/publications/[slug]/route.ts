import { NextResponse } from "next/server";
import { publicationService } from "../../../../lib/services/publicationService";
import { revalidatePublicationContent } from "../../../../lib/revalidatePublicContent";

const isNumeric = (value: string) => !isNaN(value as any) && !isNaN(parseFloat(value));

const findPublication = async (slug: string) => {
  return isNumeric(slug)
    ? publicationService.getPublicationById(slug)
    : publicationService.getPublicationBySlug(slug);
};

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const publication = await findPublication(params.slug);

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: publication }, { status: 200 });
  } catch (error: any) {
    console.error("PUBLICATION GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const publication = await findPublication(params.slug);

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updatedPublication = await publicationService.updatePublication(
      publication.id,
      body
    );

    revalidatePublicationContent([publication.slug, updatedPublication.slug]);

    return NextResponse.json(
      { success: true, data: updatedPublication },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUBLICATION UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const publication = await findPublication(params.slug);

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    await publicationService.deletePublication(publication.id);
    revalidatePublicationContent([publication.slug]);

    return NextResponse.json(
      { success: true, message: "Publication deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUBLICATION DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
