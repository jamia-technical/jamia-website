import { NextResponse } from "next/server";
import { uploadPublicationPdfToDrive } from "../../../../lib/googleDrive";

const MAX_PDF_BYTES = 150 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get("pdf") as File | null;

    if (!pdfFile) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (pdfFile.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { success: false, error: "PDF file must be 150MB or smaller" },
        { status: 413 }
      );
    }

    const result = await uploadPublicationPdfToDrive(pdfFile);

    return NextResponse.json(
      {
        success: true,
        message: "PDF upload successful",
        pdfId: result.id,
        pdfUrl: result.url,
        name: result.name,
        size: result.size,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Publication PDF upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
