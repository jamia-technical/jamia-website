"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import cookies from "js-cookie";
import axios from "axios";
import moment from "moment";
import ReactMarkdown from "react-markdown";    
import Link from "next/link";

interface BlogPost {
  title: string;
  date: string;
  content: string;
  image?: { url: string }[];
  thumbnail: { url: string };
  slug: string;
  seo?: {
    metaTtile: string;
    metaDescription: string;
    shareImage: { media: { url: string }; alt: string };
  };
  keywords?: string;
  preventIndexing?: boolean;
}

export default function BlogMore() {
  const [slug, setSlug] = useState<string | undefined>(undefined);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [similarBlog, setSimilarBlog] = useState<BlogPost[]>([]);
  const [state, setState] = useState<boolean>(false);

  useEffect(() => {
    // Read cookie on mount for App Router adaptation
    const blogId = cookies.get("blogId");
    if (blogId) {
      setSlug(blogId);
    }
  }, []);

  const fetchData = async () => {
    try {
      if (!slug) return;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/blogs?slug=${slug}`
      );
      setBlog(response.data[0]);
      setState(true);
    } catch (error) {
      console.error("Error fetching blog details:", error);
    }
  };

  const handleClick = async (id: string) => {
    cookies.set("blogId", id);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/blogs?slug=${id}`
      );
      setBlog(response.data[0]);
    } catch (error) {
      console.error("Error fetching blog details on click:", error);
    }
  };

  const fetchSimilarBlog = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/blogs?_sort=published_at:desc`
      );
      setSimilarBlog(response.data);
    } catch (error) {
      console.error("Error fetching similar blogs:", error);
    }
  };

  useEffect(() => {
    // In original code these were commented out.
    // fetchData();
    // fetchSimilarBlog();
  }, [slug]);

  if (!blog && state) {
    return <div>Blog post not found.</div>;
  }

  return (
    <>
      <Navbar/>
      <div className="blogMore">
        <div className="blog__head">
          <h1>NEWS & EVENTS</h1>
        </div>

        <div className="blogMore__content container">
          {blog && (
            <>
              <h2>{blog.title}</h2>
              <span
                className="flex"
                style={{ justifyContent: "center", marginTop: "10px" }}
              >
                <h6>{moment(blog.date).format("MMM DD YYYY")}</h6>
              </span>
              <div className="blogMore__img">
                <img
                  src={blog.image && blog.image[0] ? blog.image[0].url : ""}
                  alt={blog.title}
                />
              </div>
              <p>
                <ReactMarkdown>{blog.content}</ReactMarkdown>
              </p>
            </>
          )}
        </div>

        <div className="similar__post ">
          <h6 className="pl-10 ">Similar Posts</h6>
          {similarBlog.map((item, index) => {
            const content = item.content.slice(0, 500);
            if (index <= 1) {
              return (
                <div key={index} className="blog_row">
                  <div className="blog__box pl-5 pr-5 grid grid-cols-2 lg:grid-cols-3 gap-10">
                    <div className="blog__img">
                      <img
                        src={item.thumbnail.url}
                        alt={item.title}
                      />
                    </div>
                    <div className="blog__box__right lg:col-span-2">
                      <h3>{item.title}</h3>
                      <p>
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </p>
                      <Link href="/blog">
                        <button
                          onClick={() => handleClick(item.slug)}
                        >
                          READ MORE
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        <Footer />
      </div>
    </>
  );
}
