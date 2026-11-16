"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import JNETHallTicketPDF from "../[id]/application-pdf";


export default function PDFPreviewPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePdf = async () => {
      try {
        const blob = await pdf(<JNETHallTicketPDF data={{applicationNumber:"JN0001",name:"kunjappu"}} />).toBlob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("PDF generation error:", err);
        setError(err instanceof Error ? err.message : "Failed to generate PDF");
      }
    };

    generatePdf();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">
          📄 Quotation PDF Preview
        </h1>
        <span className="text-sm text-gray-500">
          Temp route — remove after testing
        </span>
      </div>
      <div className="flex-1">
        {error && (
          <div className="p-8 text-center text-red-600">
            <p className="font-semibold">Error generating PDF:</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}
        {!pdfUrl && !error && (
          <div className="p-8 text-center text-gray-500">
            Generating PDF preview...
          </div>
        )}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Quotation PDF Preview"
          />
        )}
      </div>
    </div>
  );
}
