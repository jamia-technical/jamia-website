import { NextResponse } from 'next/server';
import { getPool } from "../../../../../utils/db";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const slugParam = params.slug;
  const pool = getPool();

  try {
    if (!slugParam) {
      return NextResponse.json({ success: false, error: "slug required" }, { status: 400 });
    }

    // Decode slug (Unicode safe)
    const slug = decodeURIComponent(slugParam);

    const q = `
      SELECT *
      FROM news
      WHERE slug = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(q, [slug]);

    if (!rows.length) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    }, { status: 200 });
  } catch (error: any) {
    console.error("NEWS VIEW GET ERROR:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
