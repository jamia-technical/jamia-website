"use client";

import React, { useEffect, useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import cookies from "js-cookie";
import AdminNav from "@/components/AdminNav";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiImageAdd } from "react-icons/bi";
import dynamic from "next/dynamic";
import Image from "next/image";

const ReactQuill = dynamic(
  async () => {
    const RQ = await import("react-quill");
    await import("react-quill/dist/quill.snow.css");
    return RQ;
  },
  { ssr: false }
);

interface NewsFormData {
  title: string;
  content: string;
  category: string;
  image: string;
  imgId: string;
  isPublished: boolean;
}

interface CompressionResult {
  file: File;
  dataURL: string;
  originalSize: string;
  compressedSize: string;
}

interface CompressionInfo {
  original: string;
  compressed: string;
}

const compressImage = (file: File, maxSizeKB = 495): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const maxDimension = 1600;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Compression failed"));
                return;
              }

              const compressedSizeKB = blob.size / 1024;

              if (compressedSizeKB > maxSizeKB && quality > 0.05) {
                quality -= 0.05;
                compress();
              } else if (compressedSizeKB > maxSizeKB && width > 800) {
                width = Math.floor(width * 0.9);
                height = Math.floor(height * 0.9);
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                quality = 0.85;
                compress();
              } else {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, ".jpg"),
                  {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  }
                );

                resolve({
                  file: compressedFile,
                  dataURL: canvas.toDataURL("image/jpeg", quality),
                  originalSize: (file.size / 1024).toFixed(2),
                  compressedSize: compressedSizeKB.toFixed(2),
                });
              }
            },
            "image/jpeg",
            quality
          );
        };

        compress();
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const EditNews: React.FC = () => {
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    content: "",
    category: "",
    image: "",
    imgId: "",
    isPublished: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_originalImageId, setOriginalImageId] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [updatePublishedDate, setUpdatePublishedDate] = useState(false);
 
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Achievements",
    "Events",
    "Admission",
    "Education",
    "Scholarship",
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  useEffect(() => {
    const adminUser = cookies.get("admin");
    if (adminUser === "false") {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    const handleSidebarChange = (e: any) => {
      setSidebarCollapsed(e.detail?.collapsed || false);
    };

    if (typeof window !== 'undefined') {
        window.addEventListener("sidebarToggle", handleSidebarChange);
        return () =>
        window.removeEventListener("sidebarToggle", handleSidebarChange);
    }
  }, []);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (id) {
      fetchNewsData();
    }
  }, [id]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchNewsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/news/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      const data = json.data;

      setFormData({
        title: data.title || "",
        content: data.content || "",
        category: data.category || "",
        image: data.image || "",
        imgId: data.imgid || "",
        isPublished: !!data.ispublished,
      });
      setImagePreview(data.image || "");
      setOriginalImageId(data.imgid || "");
    } catch (error: any) {
      console.error("Error fetching news:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeInKB = file.size / 1024;

    setCompressing(true);
    try {
      const compressed = await compressImage(file, 450);
      const finalSizeKB = compressed.file.size / 1024;

      if (finalSizeKB > 500) {
        alert(`Image is still too large (${finalSizeKB.toFixed(2)}KB). Please choose a different image.`);
        e.target.value = "";
        return;
      }

      setImageFile(compressed.file);
      setImagePreview(compressed.dataURL);
      setCompressionInfo(
        fileSizeInKB > 500
          ? {
              original: compressed.originalSize,
              compressed: compressed.compressedSize,
            }
          : null
      );
    } catch (error) {
      console.error("Compression error:", error);
      alert("Failed to process image. Please try another image.");
      e.target.value = "";
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    setCompressionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async () => {
    if (!imageFile) {
      return null;
    }

    const form = new FormData();
    form.append("image", imageFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Image upload failed");
    }

    return {
      imageUrl: data.image,
      publicId: data.imgid,
    };
  };

  const handleSubmit = async (e: FormEvent, status: "published" | "draft") => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    if (!formData.content.trim()) {
      alert("Please enter content");
      return;
    }

    setSubmitting(true);

    try {
      const uploadResult = await uploadImage();

      const updateData: any = {
        title: formData.title,
        category: formData.category,
        content: formData.content,
      };

      if (uploadResult) {
        updateData.image = uploadResult.imageUrl;
        updateData.imgId = uploadResult.publicId;
      }

      if (status === "published") {
        updateData.isPublished = true;
        if (updatePublishedDate) {
          updateData.publishedAt = new Date().toISOString();
        }
      } else {
        updateData.isPublished = false;
      }

      const res = await fetch(
        `/api/news/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }

      if (uploadResult) {
        setFormData((prev) => ({
          ...prev,
          image: uploadResult.imageUrl,
          imgId: uploadResult.publicId,
        }));
      }

      alert("News updated successfully!");
      router.push("/admin/dashboard/news");
    } catch (error: any) {
      console.error("Error updating news:", error);
      alert("Failed to update news: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-0" : "md:ml-[280px]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit News</h1>
            <p className="text-gray-600 mt-2">
              Update the details below to edit the news post
            </p>
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading news article...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={fetchNewsData}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <form onSubmit={(e) => handleSubmit(e, "published")}>
                <div className="grid lg:grid-cols-3 gap-6 p-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        News Title *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter news title..."
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select a category...</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        News Content *
                      </label>
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
                        <ReactQuill
                          className="edit-news-editor"
                          theme="snow"
                          value={formData.content}
                          onChange={(value) =>
                            setFormData({ ...formData, content: value })
                          }
                          modules={modules}
                          placeholder="Write your news content here..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="sticky top-6">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex flex-row items-center gap-2">
                        <HiOutlinePhotograph className="text-lg" />
                        Featured Image *
                      </label>

                      <div className="mb-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                          <BiImageAdd className="text-5xl text-gray-400 mx-auto mb-3" />
                          <label className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium">
                              {compressing ? "Compressing..." : "Click to upload"}
                            </span>
                            {!compressing && (
                              <span className="text-gray-500 block mt-1">
                                or drag and drop
                              </span>
                            )}
                            <input
                              ref={fileInputRef}
                              onChange={handleImageChange}
                              type="file"
                              accept="image/*"
                              disabled={compressing}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF - Auto-compresses if over 500KB
                          </p>
                        </div>
                      </div>

                      <div>
                        {imagePreview ? (
                          <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                            <div className="relative w-full h-64">
                              <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 400px"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors shadow-lg"
                            >
                              Remove
                            </button>
                            <div className="p-3 bg-white border-t border-gray-200">
                              <p className="text-xs text-gray-600 text-center">
                                Image Preview
                              </p>
                              {compressionInfo && (
                                <p className="text-xs text-emerald-700 text-center mt-1">
                                  Compressed from {compressionInfo.original}KB to {compressionInfo.compressed}KB
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-[200px]">
                            <p className="text-gray-400 text-center">
                              No image selected
                              <br />
                              <span className="text-xs">
                                Preview will appear here
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="updatePublishedDate"
                      checked={updatePublishedDate}
                      onChange={(e) => setUpdatePublishedDate(e.target.checked)}
                      disabled={submitting}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="updatePublishedDate"
                      className="text-sm text-gray-700"
                    >
                      Update published date
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => router.push("/admin/dashboard/news")}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                      disabled={submitting || compressing}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, "draft")}
                      disabled={submitting || compressing}
                      className="px-8 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? "Saving..." : "Save as Draft"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? "Updating..." : "Update News"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .edit-news-editor .ql-container {
          min-height: 400px;
          font-size: 16px;
        }

        .edit-news-editor .ql-editor {
          min-height: 400px;
        }

        .edit-news-editor .ql-toolbar {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .edit-news-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default EditNews;
