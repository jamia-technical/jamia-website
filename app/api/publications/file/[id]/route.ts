import { NextResponse } from "next/server";
import { getDriveAccessToken } from "../../../../../lib/googleDrive";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getDriveAccessToken();
    const range = req.headers.get("range");
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${params.id}?alt=media&supportsAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(range ? { Range: range } : {}),
        },
      }
    );

    if (!driveResponse.ok || !driveResponse.body) {
      return NextResponse.json(
        { success: false, error: "Unable to read publication PDF" },
        { status: driveResponse.status || 500 }
      );
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");

    const contentLength = driveResponse.headers.get("content-length");
    const contentRange = driveResponse.headers.get("content-range");

    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentRange) headers.set("Content-Range", contentRange);

    return new NextResponse(driveResponse.body, {
      status: driveResponse.status,
      headers,
    });
  } catch (error: any) {
    console.error("Publication PDF proxy error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to load PDF" },
      { status: 500 }
    );
  }
}
