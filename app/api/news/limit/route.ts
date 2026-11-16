import { NextResponse } from 'next/server';
import { getPool } from "../../../../utils/db";
import { NewsItem } from "../../../../types";

function mapNewsRow(row: any): NewsItem | null {
  if (!row) return null;

  return {
    id: row.id,           
    title: row.title,
    content: row.content,
    image: row.image,
    slug: row.slug,
    category: row.category,
    created_at: row.createdat,
  };
}

export async function GET() {
  const pool = getPool();

  try {
    const q = `
      SELECT id,
             title,
             content,
             image,
             imgid,
             ispublished,
             createdat,
             publishedat,
             category,
             slug
      FROM news
      WHERE ispublished = TRUE
      ORDER BY COALESCE(publishedat, createdat) DESC
      LIMIT 3
    `;
    const { rows } = await pool.query(q);

    return NextResponse.json(
      { success: true, data: rows.map(mapNewsRow) },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("news/limit API error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const pool = getPool();

  try {
    const body = await req.json();
    const {
      title,
      content,
      image,
      imgId,
      isPublished,
      publishedAt,
      category,
      slug,
    } = body || {};

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const insertQ = `
      INSERT INTO news (
        title,
        content,
        image,
        imgid,
        ispublished,
        createdat,
        publishedat,
        category,
        slug
      )
      VALUES (
        $1,  -- title
        $2,  -- content
        $3,  -- image
        $4,  -- imgid
        $5,  -- ispublished
        NOW(), -- createdat
        $6,  -- publishedat
        $7,  -- category
        $8   -- slug
      )
      RETURNING
        id,
        title,
        content,
        image,
        imgid,
        ispublished,
        createdat,
        publishedat,
        category,
        slug
    `;

    const values = [
      title,
      content ?? null,
      image ?? null,
      imgId ?? null,
      typeof isPublished === "boolean" ? isPublished : false,
      publishedAt ? new Date(publishedAt) : null,
      category || "Events",
      slug ?? null,
    ];

    const { rows } = await pool.query(insertQ, values);

    return NextResponse.json(
      { success: true, data: mapNewsRow(rows[0]) },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("news/limit API error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
