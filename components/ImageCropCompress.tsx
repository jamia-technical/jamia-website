"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Check, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropCompressProps {
  file: File;
  onComplete: (croppedFile: File, previewUrl: string) => void;
  onCancel: () => void;
  maxSizeBytes?: number; // default 1MB
  aspectRatio?: number; // width/height, default 7/9 for passport
}

const PASSPORT_RATIO = 7 / 9; // 35mm x 45mm

const ImageCropCompress: React.FC<ImageCropCompressProps> = ({
  file,
  onComplete,
  onCancel,
  maxSizeBytes = 1024 * 1024,
  aspectRatio = PASSPORT_RATIO,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [processing, setProcessing] = useState(false);

  // Image display state
  const [imgDisplay, setImgDisplay] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Crop box state (relative to canvas)
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<"move" | "resize" | null>(null);

  // Zoom level
  const [zoom, setZoom] = useState(1);

  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new window.Image();
    img.onload = () => {
      setImageEl(img);
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Calculate layout when image loads or zoom changes
  useEffect(() => {
    if (!imageEl || !containerRef.current) return;

    const container = containerRef.current;
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const imgW = imageEl.naturalWidth;
    const imgH = imageEl.naturalHeight;

    // Fit image in container
    const scale = Math.min(cw / imgW, ch / imgH) * zoom;
    const displayW = imgW * scale;
    const displayH = imgH * scale;
    const displayX = (cw - displayW) / 2;
    const displayY = (ch - displayH) / 2;

    setImgDisplay({
      x: displayX,
      y: displayY,
      width: displayW,
      height: displayH,
    });

    // Initialize crop box (centered, 60% of smaller dimension)
    const cropH = Math.min(displayH * 0.75, displayW * 0.75 / aspectRatio);
    const cropW = cropH * aspectRatio;
    const cropX = displayX + (displayW - cropW) / 2;
    const cropY = displayY + (displayH - cropH) / 2;

    setCrop({
      x: cropX,
      y: cropY,
      width: cropW,
      height: cropH,
    });
  }, [imageEl, zoom, aspectRatio]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(
      imageEl,
      imgDisplay.x,
      imgDisplay.y,
      imgDisplay.width,
      imgDisplay.height
    );

    // Draw dark overlay outside crop
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    // Top
    ctx.fillRect(0, 0, canvas.width, crop.y);
    // Bottom
    ctx.fillRect(0, crop.y + crop.height, canvas.width, canvas.height - crop.y - crop.height);
    // Left
    ctx.fillRect(0, crop.y, crop.x, crop.height);
    // Right
    ctx.fillRect(crop.x + crop.width, crop.y, canvas.width - crop.x - crop.width, crop.height);

    // Crop border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    // Corner handles
    const handleSize = 12;
    ctx.fillStyle = "#ffffff";
    // Top-left
    ctx.fillRect(crop.x - 2, crop.y - 2, handleSize, 3);
    ctx.fillRect(crop.x - 2, crop.y - 2, 3, handleSize);
    // Top-right
    ctx.fillRect(crop.x + crop.width - handleSize + 2, crop.y - 2, handleSize, 3);
    ctx.fillRect(crop.x + crop.width - 1, crop.y - 2, 3, handleSize);
    // Bottom-left
    ctx.fillRect(crop.x - 2, crop.y + crop.height - 1, handleSize, 3);
    ctx.fillRect(crop.x - 2, crop.y + crop.height - handleSize + 2, 3, handleSize);
    // Bottom-right
    ctx.fillRect(crop.x + crop.width - handleSize + 2, crop.y + crop.height - 1, handleSize, 3);
    ctx.fillRect(crop.x + crop.width - 1, crop.y + crop.height - handleSize + 2, 3, handleSize);

    // Rule of thirds grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      // Vertical
      const vx = crop.x + (crop.width * i) / 3;
      ctx.beginPath();
      ctx.moveTo(vx, crop.y);
      ctx.lineTo(vx, crop.y + crop.height);
      ctx.stroke();
      // Horizontal
      const hy = crop.y + (crop.height * i) / 3;
      ctx.beginPath();
      ctx.moveTo(crop.x, hy);
      ctx.lineTo(crop.x + crop.width, hy);
      ctx.stroke();
    }

    // "Passport Size" label
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(crop.x, crop.y - 26, 100, 22);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Passport Size", crop.x + 6, crop.y - 10);
  }, [imageEl, imgDisplay, crop]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse/Touch handlers
  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const isInResizeHandle = (px: number, py: number) => {
    const margin = 20;
    const bx = crop.x + crop.width;
    const by = crop.y + crop.height;
    return (
      px >= bx - margin && px <= bx + margin &&
      py >= by - margin && py <= by + margin
    );
  };

  const isInCrop = (px: number, py: number) => {
    return (
      px >= crop.x &&
      px <= crop.x + crop.width &&
      py >= crop.y &&
      py <= crop.y + crop.height
    );
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    if (isInResizeHandle(pos.x, pos.y)) {
      setDragging(true);
      setDragMode("resize");
      setDragStart(pos);
    } else if (isInCrop(pos.x, pos.y)) {
      setDragging(true);
      setDragMode("move");
      setDragStart(pos);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !dragMode) return;
    const pos = getPointerPos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;

    if (dragMode === "move") {
      setCrop((prev) => {
        let newX = prev.x + dx;
        let newY = prev.y + dy;
        // Clamp within image bounds
        newX = Math.max(imgDisplay.x, Math.min(newX, imgDisplay.x + imgDisplay.width - prev.width));
        newY = Math.max(imgDisplay.y, Math.min(newY, imgDisplay.y + imgDisplay.height - prev.height));
        return { ...prev, x: newX, y: newY };
      });
    } else if (dragMode === "resize") {
      setCrop((prev) => {
        // Resize from bottom-right, maintain aspect ratio
        let newWidth = prev.width + dx;
        let newHeight = newWidth / aspectRatio;

        // Minimum size
        newWidth = Math.max(60, newWidth);
        newHeight = Math.max(60 / aspectRatio, newHeight);

        // Don't exceed image bounds
        const maxW = imgDisplay.x + imgDisplay.width - prev.x;
        const maxH = imgDisplay.y + imgDisplay.height - prev.y;
        if (newWidth > maxW) {
          newWidth = maxW;
          newHeight = newWidth / aspectRatio;
        }
        if (newHeight > maxH) {
          newHeight = maxH;
          newWidth = newHeight * aspectRatio;
        }

        return { ...prev, width: newWidth, height: newHeight };
      });
    }

    setDragStart(pos);
  };

  const handlePointerUp = () => {
    setDragging(false);
    setDragMode(null);
  };

  // Compress and crop
  const handleConfirm = async () => {
    if (!imageEl) return;
    setProcessing(true);

    try {
      // Calculate source crop coordinates in original image space
      const scaleX = imageEl.naturalWidth / imgDisplay.width;
      const scaleY = imageEl.naturalHeight / imgDisplay.height;

      const srcX = (crop.x - imgDisplay.x) * scaleX;
      const srcY = (crop.y - imgDisplay.y) * scaleY;
      const srcW = crop.width * scaleX;
      const srcH = crop.height * scaleY;

      // Target output: passport size at reasonable resolution
      // Standard passport photo: 413x531 pixels (at 300dpi for 35x45mm)
      const outputW = 413;
      const outputH = Math.round(outputW / aspectRatio);

      const offscreen = document.createElement("canvas");
      offscreen.width = outputW;
      offscreen.height = outputH;
      const ctx = offscreen.getContext("2d");
      if (!ctx) throw new Error("Failed to create canvas context");

      // Draw the cropped region scaled to output size
      ctx.drawImage(imageEl, srcX, srcY, srcW, srcH, 0, 0, outputW, outputH);

      // Iteratively compress until under maxSizeBytes
      let quality = 0.92;
      let blob: Blob | null = null;

      while (quality > 0.1) {
        blob = await new Promise<Blob | null>((resolve) => {
          offscreen.toBlob(
            (b) => resolve(b),
            "image/jpeg",
            quality
          );
        });

        if (blob && blob.size <= maxSizeBytes) break;
        quality -= 0.05;
      }

      // If still too large, reduce dimensions
      if (!blob || blob.size > maxSizeBytes) {
        let scale = 0.8;
        while (scale > 0.2) {
          const w = Math.round(outputW * scale);
          const h = Math.round(outputH * scale);
          offscreen.width = w;
          offscreen.height = h;
          ctx.drawImage(imageEl, srcX, srcY, srcW, srcH, 0, 0, w, h);

          blob = await new Promise<Blob | null>((resolve) => {
            offscreen.toBlob(
              (b) => resolve(b),
              "image/jpeg",
              0.8
            );
          });

          if (blob && blob.size <= maxSizeBytes) break;
          scale -= 0.1;
        }
      }

      if (!blob) throw new Error("Failed to compress image");

      const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
        type: "image/jpeg",
      });

      const previewUrl = URL.createObjectURL(blob);
      onComplete(compressedFile, previewUrl);
    } catch (err) {
      console.error("Crop/compress failed:", err);
      alert("Failed to process image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));
  const handleReset = () => setZoom(1);

  // Update cursor style
  const handleMouseMoveForCursor = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPointerPos(e);
    if (isInResizeHandle(pos.x, pos.y)) {
      canvas.style.cursor = "nwse-resize";
    } else if (isInCrop(pos.x, pos.y)) {
      canvas.style.cursor = "grab";
    } else {
      canvas.style.cursor = "default";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Crop & Compress Photo
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Drag to position • Drag corner to resize • Passport size (35×45mm)
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="relative bg-gray-900 w-full"
          style={{ height: "min(60vh, 450px)" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onMouseDown={handlePointerDown}
            onMouseMove={(e) => {
              handlePointerMove(e);
              if (!dragging) handleMouseMoveForCursor(e);
            }}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={18} className="text-gray-700" />
            </button>
            <span className="text-xs font-mono text-gray-500 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={18} className="text-gray-700" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors ml-1"
              title="Reset zoom"
            >
              <RotateCcw size={18} className="text-gray-700" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Crop & Use
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropCompress;
