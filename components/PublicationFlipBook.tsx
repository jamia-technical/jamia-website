"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PublicationFlipBookProps {
  pdfUrl: string;
  title: string;
}

interface RenderedPage {
  pageNumber: number;
  image: string;
}

interface BookDimensions {
  containerWidth: number;
  pageWidth: number;
  pageHeight: number;
  pageAspect: number;
}

const renderPdfPage = async (
  pdf: PDFDocumentProxy,
  pageNumber: number,
  width: number,
  pixelRatio: number
): Promise<RenderedPage> => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const scale = (width * pixelRatio) / viewport.width;
  const scaledViewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to render PDF page");
  }

  canvas.width = Math.floor(scaledViewport.width);
  canvas.height = Math.floor(scaledViewport.height);

  await page.render({
    canvas,
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;

  return {
    pageNumber,
    image: canvas.toDataURL("image/jpeg", 0.92),
  };
};

const PublicationFlipBook: React.FC<PublicationFlipBookProps> = ({
  pdfUrl,
  title,
}) => {
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [dimensions, setDimensions] = useState<BookDimensions>({
    containerWidth: 0,
    pageWidth: 360,
    pageHeight: 510,
    pageAspect: 1.42,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    const updateContainerWidth = () => {
      const width = containerRef.current?.clientWidth || 0;
      if (!width) return;

      setDimensions((prev) => {
        const isSinglePage = width < 760;
        const horizontalPadding = isSinglePage ? 24 : 48;
        const usableWidth = Math.max(width - horizontalPadding, 280);
        const pageWidth = isSinglePage
          ? usableWidth
          : Math.floor(usableWidth / 2);
        const pageHeight = Math.round(pageWidth * prev.pageAspect);

        return {
          ...prev,
          containerWidth: width,
          pageWidth,
          pageHeight,
        };
      });
    };

    updateContainerWidth();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateContainerWidth)
        : null;

    if (containerRef.current && resizeObserver) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateContainerWidth);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      setPages([]);

      try {
        const pdf = await getDocument({
          url: pdfUrl,
          withCredentials: false,
        }).promise;
        const firstPage = await pdf.getPage(1);
        const firstViewport = firstPage.getViewport({ scale: 1 });
        const pageAspect = firstViewport.height / firstViewport.width;
        const pixelRatio =
          typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 1;

        setDimensions((prev) => ({
          ...prev,
          pageAspect,
          pageHeight: Math.round(prev.pageWidth * pageAspect),
        }));

        const renderedPages: RenderedPage[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;
          const renderedPage = await renderPdfPage(
            pdf,
            pageNumber,
            dimensions.pageWidth,
            pixelRatio
          );
          renderedPages.push(renderedPage);
          setPages([...renderedPages]);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("PDF render error:", err);
          setError(err.message || "Unable to render this publication");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, dimensions.pageWidth]);

  const goPrev = () => {
    bookRef.current?.pageFlip()?.flipPrev();
  };

  const goNext = () => {
    bookRef.current?.pageFlip()?.flipNext();
  };

  if (error) {
    return (
      <div className="bg-white border border-red-100 rounded-xl p-8 text-center shadow-sm">
        <p className="text-red-700 font-semibold mb-3">{error}</p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary"
        >
          <Download className="w-4 h-4" />
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className="w-full" ref={containerRef}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="text-sm text-gray-600">
          {pages.length > 0
            ? `Page ${Math.min(currentPage + 1, pages.length)} of ${pages.length}`
            : "Preparing publication..."}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="Open PDF"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div
        className="flex items-center justify-center overflow-visible py-12"
        style={{ minHeight: dimensions.pageHeight + 96 }}
      >
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Rendering pages...</p>
          </div>
        ) : (
          <HTMLFlipBook
            ref={bookRef}
            key={`${dimensions.pageWidth}-${dimensions.pageHeight}`}
            width={dimensions.pageWidth}
            height={dimensions.pageHeight}
            size="fixed"
            style={{ margin: "0 auto" }}
            startPage={0}
            minWidth={dimensions.pageWidth}
            maxWidth={dimensions.pageWidth}
            minHeight={dimensions.pageHeight}
            maxHeight={dimensions.pageHeight}
            drawShadow
            flippingTime={700}
            usePortrait
            startZIndex={0}
            autoSize
            maxShadowOpacity={0.25}
            showCover
            mobileScrollSupport
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            className="publication-flip-book overflow-visible"
            onFlip={(event: any) => setCurrentPage(event.data)}
          >
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                className="bg-white shadow-xl border border-gray-200 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.image}
                  alt={`${title} page ${page.pageNumber}`}
                  className="w-full h-full object-contain bg-white"
                />
              </div>
            ))}
          </HTMLFlipBook>
        )}
      </div>

      {loading && pages.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading remaining pages...
        </div>
      )}
    </div>
  );
};

export default PublicationFlipBook;
