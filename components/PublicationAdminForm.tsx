"use client";

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { FileText, Loader2 } from "lucide-react";

interface PublicationFormState {
  title: string;
  issue: string;
  description: string;
  coverImage: string;
  coverImgId: string;
  pdfUrl: string;
  pdfId: string;
  isPublished: boolean;
}

interface PublicationAdminFormProps {
  id?: string;
  mode: "create" | "edit";
}

const emptyState: PublicationFormState = {
  title: "",
  issue: "",
  description: "",
  coverImage: "",
  coverImgId: "",
  pdfUrl: "",
  pdfId: "",
  isPublished: false,
};

const MAX_PDF_BYTES = 150 * 1024 * 1024;
const PDF_CHUNK_BYTES = 2 * 1024 * 1024;

const readApiResponse = async (res: Response) => {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
};

const PublicationAdminForm: React.FC<PublicationAdminFormProps> = ({ id, mode }) => {
  const [formData, setFormData] = useState<PublicationFormState>(emptyState);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [generatingCover, setGeneratingCover] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleSidebarChange = (e: any) => {
      setSidebarCollapsed(e.detail?.collapsed || false);
    };

    window.addEventListener("sidebarToggle", handleSidebarChange);
    return () => window.removeEventListener("sidebarToggle", handleSidebarChange);
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !id) return;

    const fetchPublication = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/publications/${id}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to load publication");
        }

        const publication = json.data;
        const nextData = {
          title: publication.title || "",
          issue: publication.issue || "",
          description: publication.description || "",
          coverImage: publication.coverimage || "",
          coverImgId: publication.coverimgid || "",
          pdfUrl: publication.pdfurl || "",
          pdfId: publication.pdfid || "",
          isPublished: !!publication.ispublished,
        };

        setFormData(nextData);
        setCoverPreview(nextData.coverImage);
      } catch (err: any) {
        setError(err.message || "Failed to load publication");
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [id, mode]);

  const generateCoverFromPdf = async (file: File) => {
    setGeneratingCover(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const maxWidth = 900;
      const scale = maxWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to generate cover image");
      }

      canvas.width = Math.floor(scaledViewport.width);
      canvas.height = Math.floor(scaledViewport.height);

      await page.render({
        canvas,
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error("Unable to export cover image"));
          },
          "image/jpeg",
          0.9
        );
      });

      const cover = new File(
        [blob],
        file.name.replace(/\.pdf$/i, "-cover.jpg"),
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        }
      );

      setCoverFile(cover);
      setCoverPreview(URL.createObjectURL(cover));
    } catch (err: any) {
      setCoverFile(null);
      setCoverPreview(formData.coverImage || "");
      throw new Error(err.message || "Failed to generate cover from PDF");
    } finally {
      setGeneratingCover(false);
    }
  };

  const handlePdfChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_BYTES) {
      alert("PDF file must be 150MB or smaller");
      e.target.value = "";
      return;
    }

    setPdfFile(file);
    try {
      await generateCoverFromPdf(file);
    } catch (err: any) {
      alert(err.message);
      setPdfFile(null);
      e.target.value = "";
    }
  };

  const uploadCover = async () => {
    if (!coverFile) return null;

    const data = new FormData();
    data.append("image", coverFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });
    const json = await readApiResponse(res);

    if (!res.ok) {
      throw new Error(json.error || "Cover upload failed");
    }

    return {
      coverImage: json.image,
      coverImgId: json.imgid,
    };
  };

  const uploadPdf = async () => {
    if (!pdfFile) return null;

    const sessionRes = await fetch("/api/publications/create-upload-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
      }),
    });
    const sessionJson = await readApiResponse(sessionRes);

    if (!sessionRes.ok) {
      throw new Error(sessionJson.error || "PDF upload session failed");
    }

    let uploadedBytes = 0;
    let finalPdfId = "";
    let finalPdfUrl = "";

    while (uploadedBytes < pdfFile.size) {
      const chunk = pdfFile.slice(
        uploadedBytes,
        Math.min(uploadedBytes + PDF_CHUNK_BYTES, pdfFile.size)
      );
      const start = uploadedBytes;
      const end = uploadedBytes + chunk.size - 1;
      const chunkData = new FormData();

      chunkData.append("uploadUrl", sessionJson.uploadUrl);
      chunkData.append("start", String(start));
      chunkData.append("end", String(end));
      chunkData.append("total", String(pdfFile.size));
      chunkData.append("chunk", chunk, pdfFile.name);

      const chunkRes = await fetch("/api/publications/upload-pdf-chunk", {
        method: "POST",
        body: chunkData,
      });
      const chunkJson = await readApiResponse(chunkRes);

      if (!chunkRes.ok) {
        throw new Error(chunkJson.error || "PDF upload failed");
      }

      uploadedBytes = end + 1;
      setUploadProgress(Math.round((uploadedBytes / pdfFile.size) * 100));

      if (chunkJson.complete) {
        finalPdfId = chunkJson.pdfId;
        finalPdfUrl = chunkJson.pdfUrl;
      }
    }

    if (!finalPdfId || !finalPdfUrl) {
      throw new Error("PDF upload completed without a Google Drive file id");
    }

    return {
      pdfUrl: finalPdfUrl,
      pdfId: finalPdfId,
    };
  };

  const submitPublication = async (status: "published" | "draft") => {
      if (generatingCover) {
        alert("Please wait until the cover is generated");
        return;
      }

      if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const cover = await uploadCover();
      const pdf = await uploadPdf();
      const payload = {
        title: formData.title,
        issue: formData.issue,
        description: formData.description,
        coverImage: cover?.coverImage || formData.coverImage,
        coverImgId: cover?.coverImgId || formData.coverImgId,
        pdfUrl: pdf?.pdfUrl || formData.pdfUrl,
        pdfId: pdf?.pdfId || formData.pdfId,
        isPublished: status === "published",
        publishedAt:
          status === "published" && !formData.isPublished
            ? new Date().toISOString()
            : undefined,
      };

      if (!payload.coverImage) {
        throw new Error("Please upload a PDF file so the cover can be generated");
      }

      if (!payload.pdfUrl || !payload.pdfId) {
        throw new Error("Please upload a PDF file");
      }

      const res = await fetch(
        mode === "edit" ? `/api/publications/${id}` : "/api/publications",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(json.error || "Failed to save publication");
      }

      router.push("/admin/dashboard/publications");
    } catch (err: any) {
      alert(err.message || "Failed to save publication");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitPublication("published");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-0" : "md:ml-[280px]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === "edit" ? "Edit Publication" : "Create Publication"}
            </h1>
            <p className="text-gray-600 mt-2">
              Upload a magazine PDF and manage its public reader details.
            </p>
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-gray-500">Loading publication...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="grid lg:grid-cols-3 gap-6 p-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Magazine title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Issue / Edition
                    </label>
                    <input
                      type="text"
                      value={formData.issue}
                      onChange={(e) =>
                        setFormData({ ...formData, issue: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Issue 01, Ramadan 2026..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Short public description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      PDF File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <label className="cursor-pointer flex flex-col items-center justify-center text-center gap-2">
                        <FileText className="w-10 h-10 text-gray-400" />
                        <span className="text-primary font-medium">
                          {pdfFile ? pdfFile.name : "Click to upload PDF"}
                        </span>
                        <span className="text-xs text-gray-500">
                          Max 150MB. Page 1 becomes the cover automatically.
                        </span>
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfChange}
                          className="hidden"
                        />
                      </label>
                      {formData.pdfId && !pdfFile && (
                        <p className="text-xs text-emerald-700 text-center mt-3">
                          Existing PDF is attached.
                        </p>
                      )}
                      {submitting && pdfFile && uploadProgress > 0 && (
                        <div className="mt-4">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="mt-2 text-center text-xs text-gray-500">
                            Uploading PDF {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Generated Cover
                    </label>

                    {generatingCover ? (
                      <div className="mt-4 border border-gray-200 rounded-lg h-80 bg-gray-50 flex flex-col items-center justify-center text-gray-500 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        Generating cover from first page...
                      </div>
                    ) : coverPreview ? (
                      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverPreview}
                          alt="Publication cover preview"
                          className="w-full h-80 object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div className="mt-4 border border-gray-200 rounded-lg h-80 bg-gray-50 flex items-center justify-center text-gray-400">
                        Upload a PDF to generate cover
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/admin/dashboard/publications")}
                  disabled={submitting || generatingCover}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => submitPublication("draft")}
                  disabled={submitting || generatingCover}
                  className="px-8 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="submit"
                  disabled={submitting || generatingCover}
                  className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicationAdminForm;
