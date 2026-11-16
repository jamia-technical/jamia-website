"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

const Abc: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <div className="w-full h-auto">
          <Image src="/images/Banner.jpg.jpeg" alt="ABC Camp Banner" width={1920} height={600} className="w-full h-auto object-cover" priority />
        </div>
        <div className="w-full py-12 px-4 bg-violet-50">
          <div className="flex justify-center">
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLScnp8zGHGgDx1XT2jMIk5KY28X1U0xrbK-PZvCaOIGaBgx5Og/viewform?embedded=true" width="100%" height="2349" frameBorder={0} marginHeight={0} marginWidth={0}>Loading…</iframe>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Abc;
