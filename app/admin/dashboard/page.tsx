"use client";

import React, { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Link from "next/link";
import { PiNewspaperClippingFill } from "react-icons/pi";
import { BookOpen, BookText, MessageSquareText } from "lucide-react";
import { HiOutlineArrowRight } from "react-icons/hi";
import useSWR from "swr";
import { LuMessageCircleQuestion } from "react-icons/lu";

interface Stats {
  newsCount: number;
  postersCount: number;
  publicationsCount: number;
  messagesCount: number;
  unreadMessages: number;
  enquiriesCount: number;
  unreadEnquiries: number;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    newsCount: 0,
    postersCount: 0,
    publicationsCount: 0,
    messagesCount: 0,
    unreadMessages: 0,
    enquiriesCount: 0,
    unreadEnquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail?.collapsed || false);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  // Fetcher function
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // Using SWR for data fetching
  const { data: newsData } = useSWR("/api/news?summary=true", fetcher);
  const { data: postersData } = useSWR("/api/images?countOnly=true", fetcher);
  const { data: publicationsData } = useSWR("/api/publications?summary=true", fetcher);
  const { data: contactData } = useSWR("/api/contact", fetcher);
  const { data: admissionsData } = useSWR("/api/getadmn", fetcher);

  useEffect(() => {
    // Process stats when data is available
    if (newsData || postersData || publicationsData || contactData || admissionsData) {
      setStats({
        newsCount: newsData?.success ? newsData.count || 0 : 0,
        postersCount: postersData?.success ? postersData.count || 0 : 0,
        publicationsCount: publicationsData?.success ? publicationsData.count || 0 : 0,
        messagesCount: contactData?.success ? (contactData.data || []).length : 0,
        unreadMessages: contactData?.success
          ? (contactData.data || []).filter((c: any) => c.status === "new").length
          : 0,
        enquiriesCount: admissionsData?.success
          ? (admissionsData.data || []).length
          : 0,
        unreadEnquiries: 0, // Assuming no read status for enquiries yet
      });
      setLoading(false);
    }
  }, [newsData, postersData, publicationsData, contactData, admissionsData]);

  const DashboardCard = ({
    title,
    count,
    icon,
    subtext,
    link,
    bgClass,
    iconClass,
  }: {
    title: string;
    count: number | string;
    icon: React.ReactNode;
    subtext?: string;
    link: string;
    bgClass: string;
    iconClass: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {loading ? "..." : count}
          </h3>
        </div>
        <div className={`p-3 rounded-full ${bgClass} ${iconClass}`}>{icon}</div>
      </div>
      {subtext && <p className="text-sm text-gray-600 mb-4">{subtext}</p>}
      <Link
        href={link}
        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
      >
        View Details <HiOutlineArrowRight className="ml-1" />
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main
        className={`transition-all duration-300 px-4 md:px-8 py-8 ${
          sidebarCollapsed ? "md:ml-0" : "md:ml-[280px]"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-2">
              Welcome back to the admin panel. Here is what&apos;s happening.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* News Card */}
            <DashboardCard
              title="Total News"
              count={stats.newsCount}
              icon={<PiNewspaperClippingFill size={24} />}
              link="/admin/dashboard/news"
              bgClass="bg-blue-50"
              iconClass="text-blue-600"
              subtext="Published articles and updates"
            />

            {/* Posters Card */}
            <DashboardCard
              title="Active Posters"
              count={stats.postersCount}
              icon={<BookText size={24} />}
              link="/admin/dashboard/posters"
              bgClass="bg-emerald-50"
              iconClass="text-emerald-600"
              subtext="Gallery images and banners"
            />

            <DashboardCard
              title="Publications"
              count={stats.publicationsCount}
              icon={<BookOpen size={24} />}
              link="/admin/dashboard/publications"
              bgClass="bg-purple-50"
              iconClass="text-purple-600"
              subtext="Magazine PDFs and page-flip readers"
            />

            {/* Messages Card */}
            <DashboardCard
              title="Messages"
              count={stats.messagesCount}
              icon={<MessageSquareText size={24} />}
              link="/admin/dashboard/contacts"
              bgClass="bg-amber-50"
              iconClass="text-amber-600"
              subtext={`${stats.unreadMessages} Unread messages pending`}
            />

            {/* Enquiries Card */}
            <DashboardCard
              title="Enquiries"
              count={stats.enquiriesCount}
              icon={<LuMessageCircleQuestion size={24} />}
              link="/admin/dashboard/enquiries"
              bgClass="bg-amber-50"
              iconClass="text-amber-600"
              subtext={`${stats.unreadEnquiries} Unread enquiries pending`}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                href="/admin/dashboard/news/Create"
                className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all text-gray-600 font-medium"
              >
                <span className="text-2xl">+</span> Create News
              </Link>
              <Link
                href="/admin/dashboard/posters"
                className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all text-gray-600 font-medium"
              >
                <span className="text-2xl">+</span> Upload Poster
              </Link>
              <Link
                href="/admin/dashboard/publications/Create"
                className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 hover:text-purple-600 transition-all text-gray-600 font-medium"
              >
                <span className="text-2xl">+</span> Create Publication
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
