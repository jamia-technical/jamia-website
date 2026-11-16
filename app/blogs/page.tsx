"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import moment from "moment";
import axios from "axios";
import Link from "next/link";
import cookies from "js-cookie";

interface BlogPost {
  id?: string | number;
  slug: string;
  title: string;
  date: string;
  content: string;
  thumbnail: {
    url: string;
  };
}

const BlogsPage: React.FC = () => {
  const [blog, setBlog] = useState<BlogPost[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);
  const data = !showMore ? blog.slice(0, 6) : blog;

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/blogs?_sort=published_at:desc`
      );
      setBlog(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    // fetchData(); // Keeping as per original
  }, []);

  return (
    <>
      <Navbar/> 
      
      <div className='blogs__head'>
        <h1>NEWS & EVENTS</h1>
      </div>

      <div className="blogs__content container">
        {data.map((item, index) => {
          const date = moment(item.date).format("MMM DD YYYY");
          const content = item.content.slice(0, 600);
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
                  <div className="grid grid-cols-1">
                    <h3 className="order-last sm:order-first">
                      {item.title}
                    </h3>
                    <span className="flex ">
                      <h5>{date}</h5>
                    </span>
                  </div>

                  <p>{content} </p>

                  <Link href="/blog">
                    <button
                      onClick={() => cookies.set("blogId", item.slug)}
                      id="blog__list__button"
                    >
                      READ MORE
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        <div className="blog__bottom flex ">
          <button onClick={() => setShowMore(!showMore)}>
            {!showMore ? "LOAD MORE" : "LOAD LESS"}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default BlogsPage;
