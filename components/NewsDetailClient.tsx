"use client";

import React, { useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { RiWhatsappFill } from "react-icons/ri";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import formatDate from "@/functions/formatDate";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface NewsItem {
  id: string | number;
  slug: string;
  title: string;
  image?: string;
  content?: string;
  publishedat?: string | null;
  createdat?: string | null;
}

interface PosterItem {
  id: string | number;
  title?: string;
  image: string;
}

interface NewsDetailClientProps {
  news: NewsItem;
  newsItems: NewsItem[];
  posters: PosterItem[];
}

const THUMB_HEIGHT = 384;

const DynamicImage = ({ image, title }: { image: string; title?: string }) => {
  const [isTall, setIsTall] = useState(false);

  return (
    <div className={`relative w-full ${isTall ? "lg:h-96 lg:overflow-hidden h-auto" : "h-auto"}`}>
      <Image
        src={image}
        alt={title || "Image"}
        sizes="(max-width: 1024px) 100vw, 100vw"
        width={1600}
        height={900}
        priority
        className={isTall ? "lg:object-cover lg:object-top object-contain w-full h-auto" : "object-contain w-full h-auto"}
        onLoadingComplete={(img) => {
          if (img.naturalHeight > THUMB_HEIGHT) setIsTall(true);
        }}
      />
    </div>
  );
};

const NewsDetailClient: React.FC<NewsDetailClientProps> = ({
  news,
  newsItems,
  posters,
}) => {
  const dateStr = news.publishedat || news.createdat;
  const publishedAt = dateStr ? formatDate(new Date(dateStr) as any) : "";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = news.title || "";

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
  };

  const shareToWhatsApp = () => {
    const decodeHtmlEntities = (text: string) => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    };
    const contentText = news.content ? news.content.replace(/<[^>]*>/g, "") : "";
    const decodedContent = decodeHtmlEntities(contentText);
    const sentences = decodedContent.match(/[^.!?]+[.!?]+/g) || [];
    const firstTwoSentences = sentences.slice(0, 2).join(" ").trim();
    const decodedUrl = decodeURIComponent(shareUrl);
    const trimmedTitle = shareTitle.trim();
    const text = `*${trimmedTitle}*\n\n${firstTwoSentences}\n\nRead more:\n${decodedUrl}\n\n======================\nFollow For Madeenathunnoor Live Updates\n\nInstagram:\nhttps://www.instagram.com/madeenathunnoor.live/\n\nFacebook:\nhttps://www.facebook.com/Madeenathunnoor.Live\n\nJamia Madeenathunnoor`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const sliderSettings = {
    dots: true,
    infinite: posters.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: posters.length > 1,
    autoplaySpeed: 5000,
    arrows: false,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24">
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                {news.image && <DynamicImage image={news.image} title={news.title} />}
                <div className="p-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{news.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mb-8 text-gray-600 text-sm">
                    <span>1 min read</span><span>|</span><span>{publishedAt}</span>
                  </div>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: news.content || "" }} />
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Share This News</h3>
                    <div className="social-share flex gap-2">
                      <button className="p-3 text-lg border border-gray-300 rounded-2xl hover:text-blue-500 hover:border-blue-500 font-medium hover:bg-gray-50 transition-all duration-300" onClick={shareToFacebook} aria-label="Share on Facebook"><FaFacebookF /></button>
                      <button className="p-3 text-lg border border-gray-300 rounded-2xl hover:text-blue-700 hover:border-blue-700 font-medium hover:bg-gray-50 transition-all duration-300" onClick={shareToLinkedIn} aria-label="Share on LinkedIn"><FaLinkedinIn /></button>
                      <button className="p-3 text-lg border border-gray-300 rounded-2xl hover:text-green-500 hover:border-green-500 font-medium hover:bg-gray-50 transition-all duration-300" onClick={shareToWhatsApp} aria-label="Share on WhatsApp"><RiWhatsappFill /></button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            <div className="space-y-8">
              {posters.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Our Achievements</h3>
                  <Slider {...sliderSettings}>
                    {posters.map((poster) => (
                      <div key={poster.id} className="px-2">
                        <div className="relative w-full h-64 rounded-lg overflow-hidden">
                          <Image src={poster.image} alt={poster.title || "Achievement"} fill className="object-cover" />
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
              {newsItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">More News</h3>
                  <div className="space-y-4">
                    {newsItems.filter((item) => item.id !== news.id && item.slug).slice(0, 5).map((item) => (
                      <Link href={`/news/${item.slug}`} key={item.id} className="block group">
                        <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          {item.image && (
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-500">
                              {item.publishedat ? formatDate(new Date(item.publishedat) as any) : item.createdat ? formatDate(new Date(item.createdat) as any) : ""}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/newses">
                    <button className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-green-800 transition-colors font-medium">View All News</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewsDetailClient;
