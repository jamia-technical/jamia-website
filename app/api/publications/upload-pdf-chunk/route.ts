import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadUrl = formData.get("uploadUrl")?.toString();
    const start = Number(formData.get("start"));
    const end = Number(formData.get("end"));
    const total = Number(formData.get("total"));
    const chunk = formData.get("chunk") as File | null;

    if (!uploadUrl || !Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(total) || !chunk) {
      return NextResponse.json(
        { success: false, error: "Missing upload chunk data" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await chunk.arrayBuffer());
    const driveResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(bytes.length),
        "Content-Range": `bytes ${start}-${end}/${total}`,
      },
      body: bytes,
      redirect: "manual",
    });

    if (driveResponse.status === 308) {
      return NextResponse.json(
        { success: true, complete: false },
        { status: 200 }
      );
    }

    const text = await driveResponse.text();
    let data: any = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
    }

    if (!driveResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || data.error || "PDF chunk upload failed",
        },
        { status: driveResponse.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        complete: true,
        pdfId: data.id,
        pdfUrl: data.id ? `/api/publications/file/${data.id}` : undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Publication chunk upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Chunk upload failed" },
      { status: 500 }
    );
  }
}
