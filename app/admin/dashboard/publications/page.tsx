"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import {
  BookOpen,
  BookX,
  CirclePlus,
  ExternalLink,
  FileText,
  FolderUp,
  SquarePen,
  Trash,
} from "lucide-react";

interface Publication {
  id: number;
  title: string;
  issue?: string;
  description?: string;
  coverimage?: string;
  coverimgid?: string;
  pdfid?: string;
  slug: string;
  ispublished?: boolean;
  createdat?: string;
  publishedat?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PublicationManagementPage: React.FC = () => {
  const [data, setData] = useState<Publication[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/publications");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to load publications");
      }

      setData(json.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load publications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const handleSidebarChange = (e: any) => {
      setSidebarCollapsed(e.detail?.collapsed || false);
    };

    window.addEventListener("sidebarToggle", handleSidebarChange);
    return () => window.removeEventListener("sidebarToggle", handleSidebarChange);
  }, []);

  const filteredData = data.filter((item) => {
    if (filter === "published") return item.ispublished;
    if (filter === "draft") return !item.ispublished;
    return true;
  });

  const updatePublishState = async (id: number, publish: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [`publish-${id}`]: true }));
    try {
      const res = await fetch(`/api/publications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: publish,
          ...(publish ? { publishedAt: new Date().toISOString() } : {}),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to update publication");
      }

      await getData();
    } catch (err: any) {
      alert(err.message || "Failed to update publication");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`publish-${id}`]: false }));
    }
  };

  const deleteRemoteFiles = async (publication: Publication) => {
    if (publication.coverimgid) {
      await fetch("/api/deleteImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: publication.coverimgid }),
      }).catch(() => null);
    }

    if (publication.pdfid) {
      await fetch("/api/publications/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: publication.pdfid }),
      }).catch(() => null);
    }
  };

  const handleDelete = async (publication: Publication) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;

    setLoadingStates((prev) => ({ ...prev, [`delete-${publication.id}`]: true }));
    try {
      await deleteRemoteFiles(publication);

      const res = await fetch(`/api/publications/${publication.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to delete publication");
      }

      await getData();
    } catch (err: any) {
      alert(err.message || "Failed to delete publication");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-${publication.id}`]: false,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminNav />
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-0" : "ml-0 md:ml-[280px]"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-full mx-auto">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Publication Management
                </h1>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-900">{data.length}</span>{" "}
                    Total
                  </span>
                  <span className="text-emerald-600">
                    <span className="font-semibold">
                      {data.filter((item) => item.ispublished).length}
                    </span>{" "}
                    Published
                  </span>
                  <span className="text-amber-600">
                    <span className="font-semibold">
                      {data.filter((item) => !item.ispublished).length}
                    </span>{" "}
                    Draft
                  </span>
                </div>
              </div>
              <Link
                href="/admin/dashboard/publications/Create"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 py-3 px-6 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <CirclePlus className="w-5 h-5" />
                Add Publication
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-5 mt-5 border-t border-gray-100 justify-center">
              {[
                ["all", "All Publications"],
                ["published", "Published"],
                ["draft", "Draft"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                    filter === value
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
              <p className="text-gray-500 mt-4 font-medium">
                Loading publications...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <p className="text-red-800 font-medium">Error: {error}</p>
              <button
                onClick={getData}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredData.length === 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-16 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No publications found
              </p>
            </div>
          )}

          {!loading && !error && filteredData.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                        Cover
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                        Issue
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                        Published
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.map((publication) => {
                      const isUpdating =
                        loadingStates[`publish-${publication.id}`];
                      const isDeleting =
                        loadingStates[`delete-${publication.id}`];

                      return (
                        <tr
                          key={publication.id}
                          className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all"
                        >
                          <td className="px-6 py-5">
                            {publication.coverimage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={publication.coverimage}
                                alt={publication.title}
                                className="w-20 h-24 object-cover object-top rounded-lg border border-gray-100 shadow-sm"
                              />
                            ) : (
                              <div className="w-20 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold text-gray-900 max-w-md line-clamp-2">
                              {publication.title}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700">
                            {publication.issue || "N/A"}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                                publication.ispublished
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-100 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {publication.ispublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700">
                            {formatDate(publication.publishedat)}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/publication/${publication.slug}`}
                                target="_blank"
                                className="bg-gray-700 hover:bg-gray-800 text-white p-2.5 rounded-lg"
                                title="View public page"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/admin/dashboard/publications/Edit/${publication.id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg"
                                title="Edit"
                              >
                                <SquarePen className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() =>
                                  updatePublishState(
                                    publication.id,
                                    !publication.ispublished
                                  )
                                }
                                disabled={isUpdating || isDeleting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg disabled:opacity-50"
                                title={
                                  publication.ispublished
                                    ? "Unpublish"
                                    : "Publish"
                                }
                              >
                                {publication.ispublished ? (
                                  <BookX className="w-4 h-4" />
                                ) : (
                                  <FolderUp className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(publication)}
                                disabled={isDeleting || isUpdating}
                                className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicationManagementPage;
