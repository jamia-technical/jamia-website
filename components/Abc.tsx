import Image from "next/image";
import Link from "next/link";
import React from "react";

const Abc: React.FC = () => {
  return (
    <section className="w-full mx-auto relative mt-10" id="summer-vibe">
      <Image
        src="/images/Banner.jpg.jpeg"
        alt="Summer Vibe"
        width={1920}
        height={600}
        className="w-full h-auto"
        priority
      />
      <Link href="/events/abc" className="px-8 py-3 hidden md:block absolute top-1/4 left-[60%] transform -translate-x-1/2 -translate-y-1/2 bg-violet-600 text-white font-medium text-2xl rounded-xl hover:bg-violet-500 transition-colors duration-300 shadow-md hover:shadow-lg">
        Register Now
      </Link>
      
      <Link href="/events/abc" className="px-5 py-1.5 md:hidden absolute top-[35%] left-[58%] transform -translate-x-1/2 -translate-y-1/2 bg-violet-600 text-white font-medium text-sm rounded-lg hover:bg-violet-500 transition-colors duration-300 shadow-md hover:shadow-lg">
        Register
      </Link>
    </section>
  );
};

export default Abc;
