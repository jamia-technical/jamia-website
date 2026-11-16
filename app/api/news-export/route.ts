import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "csv").toLowerCase();

    const base = process.env.NEXT_PUBLIC_PORT ? process.env.NEXT_PUBLIC_PORT : new URL(req.url).origin;
    const apiRes = await fetch(`${base}/api/news`, { headers: { "Content-Type": "application/json" }});
    if (!apiRes.ok) {
      const txt = await apiRes.text();
      return NextResponse.json({ error: "Failed to fetch news: " + txt }, { status: 500 });
    }
    const json = await apiRes.json();
    const news = Array.isArray(json.data) ? json.data : (json || []);

    const escapeCsv = (val: any = "") => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

    // CSV
    const csvCols = ["_id","title","content","image","imgId","isPublished","createdAt","publishedAt"];
    let csv = csvCols.join(",") + "\n";
    for (const r of news) {
      const row = csvCols.map(c => {
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
        "Content-Disposition": `attachment; filename="news-export-${Date.now()}.csv"`,
      },
    });

  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
