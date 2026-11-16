"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import AdminNav from "@/components/AdminNav";
import Image from "next/image";

interface Poster {
  id: string | number;
  image: string;
  imgid: string;
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

const PostersPage: React.FC = () => {
  const [img, setImg] = useState("");
  const [data, setData] = useState<Poster[]>([]);
  const [deleting, setDeleting] = useState<string | number>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Listen to sidebar toggle events from AdminNav
  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarOpen(!event.detail?.collapsed);
    };

    if (typeof window !== "undefined") {
        window.addEventListener('sidebarToggle', handleSidebarToggle);
        return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
    }
  }, []);

  // Fetch real data from API
  const getData = async () => {
    try {
      const res = await fetch("/api/images");
      const json = await res.json();
      setData(json.data || []);
    } catch (error) {
      console.error("Failed to fetch posters:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleImg = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    const fileSizeInKB = selectedFile.size / 1024;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(selectedFile, 450);
      const finalSizeKB = compressed.file.size / 1024;

      if (finalSizeKB > 500) {
        alert(`Poster image is still too large (${finalSizeKB.toFixed(2)}KB). Please choose a different image.`);
        e.target.value = "";
        return;
      }

      setFile(compressed.file);
      setImg(compressed.dataURL);
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
      setIsCompressing(false);
    }
  };

  const addPoster = async (uploadData: { image: string; imgid: string }) => {
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: uploadData.image, 
          imgid: uploadData.imgid,  
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "DB insert failed");
      }

      setIsUploading(false);
      setIsOpen(false);
      getData();
      setImg("");
      setFile(null);
      setCompressionInfo(null);
    } catch (error: any) {
      setIsUploading(false);
      alert(error.message);
    }
  };

  const deleteDoc = async (id: string | number) => {
    try {
      await fetch(`/api/images/delete/${id}`, {
        method: "DELETE",
      });
      setDeleting("");
      getData();
    } catch (error) {
      setDeleting("");
      console.error("Delete from DB failed:", error);
    }
  };

  const handleDelete = async (id: string | number, imgid: string) => {
    if (!confirm("Are you sure you want to delete this poster?")) return;

    setDeleting(id);

    try {
      const response = await fetch("/api/deleteImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId: imgid }),
      });

      const responseData = await response.json();

      if (response.ok) {
        await deleteDoc(id); 
      } else {
        throw new Error(responseData.error || "Deletion failed");
      }
    } catch (error: any) {
      setDeleting("");
      alert("Delete error: " + error.message);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await response.json();
      if (response.ok) {
        addPoster(uploadData);
      } else {
        throw new Error(uploadData.error || "Upload failed");
      }
    } catch (error: any) {
      setIsUploading(false);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div 
        className={`px-4 md:px-6 py-8 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-72' : 'md:ml-0'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Posters Management</h1>
                <p className="text-gray-500 mt-1">Manage and organize Posters </p>
              </div>
              <button
                   className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 py-3 px-6 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                onClick={() => setIsOpen(true)}
              >
               <PlusCircle className="w-5 h-5" />Add Poster
              </button>
            </div>
          </div>

          {data.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posters Yet</h3>
              <p className="text-gray-500">Click &quot;Add Poster&quot; to upload your first poster</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentItems.map((d) => (
                  <div 
                    key={d.id} 
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                      <Image 
                        src={d.image} 
                        alt="Poster"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="p-4">
                      <button
                        className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDelete(d.id, d.imgid)}
                        disabled={deleting === d.id}
                      >
                        {deleting === d.id ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Deleting...
                          </span>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex flex-wrap gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      const isCurrentPage = currentPage === pageNumber;
                      
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              isCurrentPage
                                ? 'bg-emerald-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length} posters
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Upload New Poster</h2>
              <p className="text-sm text-gray-500 mt-1">Select an image file (max 500KB)</p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setFile(null);
                  setImg("");
                  setCompressionInfo(null);
                }}
                className="absolute right-6 top-6 text-gray-400 hover:text-red-500 transition-colors"
              >
                <IoIosCloseCircle className="text-3xl" />
              </button>
            </div>

            <div className="p-6">
              {!file ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                  <div className="text-4xl mb-4">📤</div>
                  <label className="cursor-pointer">
                    <span className="text-emerald-600 hover:text-emerald-700 font-medium">
                      {isCompressing ? "Compressing..." : "Click to upload"}
                    </span>
                    {!isCompressing && <span className="text-gray-500"> or drag and drop</span>}
                    <input
                      onChange={handleImg}
                      accept="image/*"
                      type="file"
                      disabled={isCompressing}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG - Auto-compresses if over 500KB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden relative aspect-[4/5]">
                    <Image 
                      src={img} 
                      alt="Preview"
                      fill
                      className="object-contain bg-gray-50"
                      sizes="400px"
                    />
                  </div>
                  {compressionInfo && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      Compressed from {compressionInfo.original}KB to {compressionInfo.compressed}KB
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      onClick={() => {
                        setFile(null);
                        setImg("");
                        setCompressionInfo(null);
                      }}
                    >
                      Change Image
                    </button>

                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={isUploading || isCompressing}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? "Uploading..." : 'Upload Poster'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostersPage;
