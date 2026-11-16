"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaNewspaper,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

interface NewsListItem {
  id: string | number;
  title: string;
  slug: string;
  image?: string;
  content?: string;
  category?: string;
}

interface NewsListClientProps {
  newsItems: NewsListItem[];
}

const extractExcerpt = (html: string = "", length: number = 120) => {
  const text = html.replace(/<[^>]*>/g, " ");
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const categories = [
  "All",
  "Achievements",
  "Events",
  "Education",
  "Admission",
  "Scholarship",
];

const NewsListClient: React.FC<NewsListClientProps> = ({ newsItems }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const filteredNews =
    selectedCategory === "All"
      ? newsItems
      : newsItems.filter((news) => news.category === selectedCategory);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const goToPage = (page: number | string) => {
    if (typeof page === "number") {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-wrap gap-2 mb-8 text-center justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full ${
              category === selectedCategory
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border border-gray-200 transition-colors`}
          >
            {category}
          </button>
        ))}
      </div>

      {currentNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentNews.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-56 w-full">
                {news.image && (
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover object-top"
                  />
                )}
                {news.category && (
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {news.category}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {news.title}
                </h3>
                <p className="text-gray-600 mb-5">{extractExcerpt(news.content)}</p>
                <Link href={`/news/${news.slug}`}>
                  <button className="text-primary font-medium flex items-center hover:text-secondary">
                    Read More <FaArrowRight className="ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No news found in this category.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <FaChevronLeft />
          </button>

          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsListClient;
