import { NextResponse } from "next/server";
import { createPublicationPdfUploadSession } from "../../../../lib/googleDrive";

const MAX_PDF_BYTES = 150 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, fileSize } = body || {};

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Missing fileName" },
        { status: 400 }
      );
    }

    if (fileSize && fileSize > MAX_PDF_BYTES) {
      return NextResponse.json(
        { success: false, error: "PDF file must be 150MB or smaller" },
        { status: 413 }
      );
    }

    const uploadUrl = await createPublicationPdfUploadSession(fileName);

    return NextResponse.json({ success: true, uploadUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Publication upload session error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload session failed" },
      { status: 500 }
    );
  }
}
