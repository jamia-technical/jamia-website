import { NextResponse } from 'next/server';
import { getPool } from "../../../../../utils/db";
import { revalidatePosterContent } from "../../../../../lib/revalidatePublicContent";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const pool = getPool();
  const idStr = params.id;

  try {
    if (!idStr) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );
    }

    const deleteQuery = `
      DELETE FROM images
      WHERE id = $1
      RETURNING id;
    `;

    const result = await pool.query(deleteQuery, [idStr]);
    const rows = result.rows;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    revalidatePosterContent();

    return NextResponse.json(
      { success: true, data: { id: rows[0].id } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE images error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
