import { NextResponse } from "next/server";
import { deletePublicationPdfFromDrive } from "../../../../lib/googleDrive";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId } = body || {};

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "Missing fileId" },
        { status: 400 }
      );
    }

    try {
      await deletePublicationPdfFromDrive(fileId);
    } catch (error: any) {
      if (error?.code !== 404) throw error;
    }

    return NextResponse.json(
      { success: true, message: "PDF deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Publication PDF delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Deletion failed" },
      { status: 500 }
    );
  }
}
