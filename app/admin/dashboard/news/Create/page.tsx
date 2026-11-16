"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import cookies from "js-cookie";
import dynamic from "next/dynamic";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiImageAdd } from "react-icons/bi";
import AdminNav from "@/components/AdminNav";

const Quill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const makeSlug = (): string => {
  return crypto.randomUUID().slice(0, 12);
};

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
      const img = new Image();
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
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
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

const CreateNews: React.FC = () => {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [img, setImg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionInfo | null>(null);

  const router = useRouter();

  const categories = [
    "Achievements",
    "Events",
    "Admission",
    "Education",
    "Scholarship",
  ];

  useEffect(() => {
    const adminUser = cookies.get("admin");
    if (adminUser === "false") {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail?.collapsed || false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("sidebarToggle", handleSidebarToggle);
      return () =>
        window.removeEventListener("sidebarToggle", handleSidebarToggle);
    }
  }, []);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  const handleTitle = (e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
  const handleCategory = (e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value);

  const handleImg = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileSizeInKB = selectedFile.size / 1024;
    
    setCompressing(true);
    try {
      const compressed = await compressImage(selectedFile, 450);
      
      const finalSizeKB = compressed.file.size / 1024;
      if (finalSizeKB > 500) {
        alert(`Image is still too large (${finalSizeKB.toFixed(2)}KB). Please choose a different image.`);
        setCompressing(false);
        e.target.value = "";
        return;
      }
      
      setFile(compressed.file);
      setImg(compressed.dataURL);
      
      if (fileSizeInKB > 500) {
        setCompressionInfo({
          original: compressed.originalSize,
          compressed: compressed.compressedSize,
        });
      } else {
        setCompressionInfo(null);
      }
      
      setCompressing(false);
    } catch (error) {
      console.error("Compression error:", error);
      alert("Failed to process image. Please try another image.");
      setCompressing(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImg("");
    setFile(null);
    setCompressionInfo(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleUpload = async (e: FormEvent, publish = true) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!category) {
      alert("Please select a category");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }

    if (!file) {
      alert("Please select an image");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        await addBlog(data, publish);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      alert(error.message);
      setUploading(false);
    }
  };

  const addBlog = async (imgData: any, publish: boolean) => {
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          content: description,
          image: imgData.image,          
          imgId: imgData.imgid,          
          isPublished: publish,
          publishedAt: publish ? new Date().toISOString() : null,
          category: category,
        }),
      });

      if (res.ok) {
        router.push("/admin/dashboard/news");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to create news post");
        setUploading(false);
      }
    } catch (error: any) {
      alert(error.message);
      setUploading(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Create News</h1>
            <p className="text-gray-600 mt-2">
              Fill in the details below to create a new news post
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <form onSubmit={(e) => handleUpload(e, true)}>
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
                      value={title}
                      onChange={handleTitle}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                      value={category}
                      onChange={handleCategory}
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
                      <Quill
                        className="create-news-editor"
                        value={description}
                        onChange={handleDescriptionChange}
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ align: [] }],
                            ["link", "image"],
                            ["clean"],
                          ],
                        }}
                        formats={[
                          "header",
                          "bold",
                          "italic",
                          "underline",
                          "strike",
                          "list",
                          "bullet",
                          "align",
                          "link",
                          "image",
                        ]}
                        placeholder="Write your news content here..."
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
                          <span className="text-gray-500 block mt-1">
                            or drag and drop
                          </span>
                          <input
                            onChange={handleImg}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            required
                            disabled={compressing}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG, GIF - Auto-compresses if over 500KB
                        </p>
                      </div>
                    </div>

                    <div>
                      {compressing ? (
                        <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[200px]">
                          <svg
                            className="animate-spin h-10 w-10 text-blue-600 mb-3"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <p className="text-gray-600 text-center">
                            Compressing image...
                          </p>
                        </div>
                      ) : img ? (
                        <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                          />
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

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/admin/dashboard/news")}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={uploading || compressing}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={(e) => handleUpload(e, false)}
                  disabled={uploading || compressing}
                  className="px-8 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? "Saving..." : "Save as Draft"}
                </button>

                <button
                  type="submit"
                  disabled={uploading || compressing}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? "Publishing..." : "Publish News"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .create-news-editor .ql-container {
          min-height: 400px;
          font-size: 16px;
        }

        .create-news-editor .ql-editor {
          min-height: 400px;
        }

        .create-news-editor .ql-toolbar {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .create-news-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default CreateNews;
