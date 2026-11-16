import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "csv").toLowerCase(); // csv | sql

    const base = process.env.NEXT_PUBLIC_PORT ? process.env.NEXT_PUBLIC_PORT : new URL(req.url).origin;
    const apiRes = await fetch(`${base}/api/images`, { headers: { "Content-Type": "application/json" }});
    if (!apiRes.ok) {
      const txt = await apiRes.text();
      return NextResponse.json({ error: "Failed to fetch posters: " + txt }, { status: 500 });
    }

    const json = await apiRes.json();
    const posters = Array.isArray(json.data) ? json.data : (json || []);

    const escapeCsv = (val: any = "") => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const escapeSqlStr = (val: any) => {
      if (val === null || val === undefined) return "NULL";
      return "'" + String(val).replace(/'/g, "''") + "'";
    };

    const cols = ["id", "image", "imgid", "timestamp"];

    if (type === "sql") {
      let sql = `-- Poster SQL Export generated at ${new Date().toISOString()}\n\n`;
      sql += `DELETE FROM "images";\n\n`; 
      for (const r of posters) {
        const vals = cols.map(c => {
          let v = r[c];
          if (v === null || v === undefined) return "NULL";
          if (typeof v === "boolean") return v ? "1" : "0";
          if (typeof v === "object") v = JSON.stringify(v);
          return escapeSqlStr(v);
        });
        sql += `INSERT INTO "images" ("${cols.join('","')}") VALUES (${vals.join(", ")});\n`;
      }

      return new NextResponse(sql, {
        status: 200,
        headers: {
          "Content-Type": "application/sql; charset=utf-8",
          "Content-Disposition": `attachment; filename="posters-export-${Date.now()}.sql"`,
        },
      });
    }

    // CSV default
    let csv = cols.join(",") + "\n";
    for (const r of posters) {
      const row = cols.map(c => {
        let v = r[c];
        if (typeof v === "object" && v !== null) v = JSON.stringify(v);
        return escapeCsv(v);
      }).join(",");
      csv += row + "\n";
    }

    // Prepend UTF-8 BOM so Excel recognizes UTF-8
    const csvWithBom = "\uFEFF" + csv;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="posters-export-${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("poster-export error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
