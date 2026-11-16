"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import cookies from "js-cookie";
import AdminNav from "@/components/AdminNav";
import { ArrowLeft, Calendar, Eye, EyeOff } from "lucide-react";

interface News {
  id: string | number;
  title: string;
  image?: string;
  content: string;
  isPublished?: boolean;
  ispublished?: boolean;
  createdAt?: string;
  createdat?: string;
  publishedAt?: string;
  publishedat?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return "Invalid Date";
  }
};

const ViewNews: React.FC = () => {
  const [newsData, setNewsData] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const adminUser = cookies.get("admin");
    if (adminUser === "false") {
      router.push("/admin/login");
    }
  }, [router]);

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
      const res = await fetch(`/api/news/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      setNewsData(json.data);
    } catch (error: any) {
      console.error('Error fetching news:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarChange = (e: any) => {
      setSidebarCollapsed(e.detail?.collapsed || false);
    };
    
    if (typeof window !== "undefined") {
        window.addEventListener('sidebarToggle', handleSidebarChange);
        return () => window.removeEventListener('sidebarToggle', handleSidebarChange);
    }
  }, []);

  const isPublished = newsData?.isPublished ?? newsData?.ispublished;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : 'ml-0 md:ml-[280px] lg:ml-[280px]'
      }`}>
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
          <div className="mb-6">
            <Link
              href="/admin/dashboard/news"
              passHref
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to News List</span>
            </Link>
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
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

          {!loading && !error && newsData && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className={`px-6 py-4 ${
                isPublished ? 'bg-green-50 border-b border-green-200' : 'bg-yellow-50 border-b border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isPublished ? (
                      <Eye className="w-5 h-5 text-green-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className={`font-semibold ${
                      isPublished ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <Link
                    href={`/admin/dashboard/news/Edit/${id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Edit Article
                  </Link>
                </div>
              </div>

              {newsData.image && (
                <div className="w-full h-96 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={newsData.image}
                    alt={newsData.title}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              )}

              <div className="p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {newsData.title}
                </h1>

                <div className="grid md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Created At</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(newsData.createdAt || newsData.createdat)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Published At</p>
                      <p className="text-sm text-gray-600">
                        {isPublished ? formatDate(newsData.publishedAt || newsData.publishedat) : 'Not Published'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: newsData.content }}
                    className="text-gray-700 leading-relaxed"
                  />
                </div>
              </div>

              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap gap-3 justify-end">
                  <Link
                    href="/admin/dashboard/news"
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Back to List
                  </Link>
                  <Link
                    href={`/admin/dashboard/news/Edit/${id}`}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Edit Article
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNews;
