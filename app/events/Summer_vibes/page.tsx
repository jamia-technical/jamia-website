"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

const SummerVibes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <div className="w-full h-auto">
          <Image src="/images/summer-vibe.png" alt="Summer Vibes Header" width={1920} height={600} className="w-full h-auto object-cover hidden md:block" priority />
          <Image src="/images/JSV 26 english copy.webp" alt="Summer Vibes Header" width={1080} height={1920} className="w-full h-auto object-cover md:hidden" priority />
        </div>
        <div className="w-full py-12 px-4 bg-orange-50">
          <div className="flex justify-center">
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdH65EuWM7bqn--P5LeAl8nJfP-Vp5AFi3hFennSMPQVwHE4A/viewform?embedded=true" width="100%" height="2450" frameBorder={0} marginHeight={0} marginWidth={0} className="max-w-full">Loading…</iframe>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SummerVibes;
