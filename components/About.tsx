import React from "react";
import Image from "next/image";
import Link from "next/link";

const AboutSection: React.FC = () => {
  return (
    <section
      className="py-16 bg-white "
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="w-[90%] max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/photos/16.jpg"
              alt="Our University Campus"
              fill
              className="object-cover"
            />
          </div>

          <div className="w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              About <span className="text-secondary">JMN</span>
            </h2>

            <div className="space-y-4 text-gray-600 mb-8">
              <p>
                Jamia Madeenathunnoor epitomizes excellence, blending
                traditional Islamic studies with diverse academic disciplines.
                <br />
                <br />
                Its multicultural environment fosters vibrant discourse, while
                its serene campus promotes holistic growth. Emphasizing moral
                values and well-being, the Jamia cultivates leaders who embody
                intellect, integrity, and compassion.
                <br />
                <br />
                With dedicated faculties, Jamia Madeenathunnoor stands as a
                beacon of enlightenment, shaping future generations poised to
                make meaningful contributions to society.
              </p>
            </div>

            <Link passHref href={"/About"}>
              <button className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors duration-300 shadow-md hover:shadow-lg">
                Know More
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
