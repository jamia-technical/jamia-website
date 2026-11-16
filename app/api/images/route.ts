import { NextResponse } from 'next/server';
import { getPool } from "../../../utils/db";
import { revalidatePosterContent } from "../../../lib/revalidatePublicContent";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const parsedLimit = limitParam ? parseInt(limitParam, 10) : null;
  const limit = parsedLimit && !isNaN(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, 100)
    : null;
  const includeCount = searchParams.get("includeCount") === "true";
  const countOnly = searchParams.get("countOnly") === "true";

  const pool = getPool();
  try {
    let query = "SELECT id, image, imgid, timestamp FROM images ORDER BY id DESC";
    const values = [];

    if (limit) {
      query += " LIMIT $1";
      values.push(limit);
    }

    const [result, countResult] = await Promise.all([
      countOnly ? Promise.resolve({ rows: [] }) : pool.query(query, values),
      includeCount || countOnly ? pool.query("SELECT COUNT(*)::int AS count FROM images") : Promise.resolve(null),
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows,
      ...(countResult ? { count: countResult.rows[0]?.count || 0 } : {}),
    }, { status: 200 });
  } catch (err: any) {
    console.error("Images API error text:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Server error",
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const pool = getPool();
  try {
    const body = await req.json();
    const { image, imgid } = body || {};

    if (!image || !imgid) {
      return NextResponse.json({
        success: false,
        error: "image and imgid are required",
      }, { status: 400 });
    }

    const insertQuery = "INSERT INTO images (image, imgid) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(insertQuery, [image, imgid]);

    revalidatePosterContent();

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    }, { status: 201 });
  } catch (err: any) {
    console.error("Images API error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Server error",
    }, { status: 500 });
  }
}
