"use client";

import Link from "next/link";
import Marquee from "react-fast-marquee";

const HomeMarquee = () => {
  return (
    <Marquee pauseOnHover speed={100} className="bg-primary py-1 text-white text-sm font-medium">
      <Link href="/jnet-result">
        The J-NET entrance exam results for Jamia Madeenathunnoor&apos;s Junior School of Science & Technology and Senior School of Life Science (Biology) have been published. click here to view
      </Link>
    </Marquee>
  );
};

export default HomeMarquee;
