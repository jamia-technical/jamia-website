import Image from "next/image";
import Link from "next/link";
import React from "react";

const SummerVibe: React.FC = () => {
  return (
    <section className="w-full mx-auto relative mt-10" id="summer-vibe">
      <Image
        src="/images/summer-vibe.png"
        alt="Summer Vibe"
        width={1920}
        height={600}
        className="w-full h-auto hidden md:block"
        priority
      />
      <Link href="/events/Summer_vibes" className="px-8 py-3 hidden md:block absolute top-3/4 left-[60%] transform -translate-x-1/2 -translate-y-1/2 bg-white text-orange-700 font-medium text-2xl rounded-xl hover:bg-orange-100 transition-colors duration-300 shadow-md hover:shadow-lg">
        Register Now
      </Link>
      <Image
        src="/images/JSV 26 english copy.webp"
        alt="Summer Vibe"
        width={1080}
        height={1920}
        className="w-full h-auto md:hidden"
        priority
      />
      <Link href="/events/Summer_vibes" className="px-5 py-1.5 md:hidden absolute top-[87%] left-[69%] transform -translate-x-1/2 -translate-y-1/2 bg-white text-orange-700 font-medium text-sm rounded-lg hover:bg-orange-100 transition-colors duration-300 shadow-md hover:shadow-lg">
        Register
      </Link>
    </section>
  );
};

export default SummerVibe;
