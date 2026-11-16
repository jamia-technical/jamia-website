import React from "react";
import { Metadata } from "next";
import {
  FaHome,
  FaUniversity,
  FaBook,
  FaUserGraduate,
  FaNewspaper,
  FaEnvelope,
  FaSearch,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "Site Map | Jamia Madeenathunnoor",
  description: "Comprehensive overview of all pages on our university website",
};

interface SitemapChild {
  title: string;
  href: string;
}

interface SitemapSubsection {
  title: string;
  href: string;
  children?: SitemapChild[];
}

interface SitemapSection {
  title: string;
  href: string;
  icon?: React.ReactElement;
  subsections?: SitemapSubsection[];
}

export default function UniversitySiteMap() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mainSections: SitemapSection[] = [
    {
      title: "Home",
      href: "/",
      icon: <FaHome />,
    },
    {
      title: "About the University",
      href: "/about",
      icon: <FaUniversity />,
      subsections: [
        {
          title: "Overview",
          href: "/about/overview",
        },
        {
          title: "Leadership",
          href: "/about/leadership",
          children: [
            { title: "Senate", href: "/leadership/Senate" },
            { title: "Academic Council", href: "/leadership/Academic" },
            { title: "Executive Council", href: "/leadership/Exicutive" },
            { title: "Finance Committee", href: "/leadership/Finance" },
          ],
        },
      ],
    },
    {
      title: "Academic Programmes",
      href: "/programmes",
      icon: <FaBook />,
      subsections: [
        {
          title: "HS Programmes",
          href: "/Programmes/Hs",
        },
        {
          title: "HSS Programmes",
          href: "/Programmes/Hss",
        },
        {
          title: "BS Programmes",
          href: "/Programmes/Bs",
        },
      ],
    },
    {
      title: "Campuses & Facilities",
      href: "/campuses",
      icon: <FaUniversity />,
      subsections: [
        {
          title: "On-Campus",
          href: "/campuses/OnCampuses",
        },
        {
          title: "Science Academies",
          href: "/campuses/Science",
        },
        {
          title: "Erthunnabavi Campus",
          href: "/campuses/erthunnabavi",
        },
      ],
    },
    {
      title: "Alumni",
      href: "/alumni",
      icon: <FaUserGraduate />,
    },
    {
      title: "News & Events",
      href: "/newses",
      icon: <FaNewspaper />,
    },
    {
      title: "Contact Us",
      href: "/contact",
      icon: <FaEnvelope />,
    },
  ];

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-3xl mb-4">
            JMN Website Site Map
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore the complete structure of our JMN&apos;s digital presence
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-5 bg-primary">
            <h2 className="text-2xl font-bold text-white">
              Navigate the Website
            </h2>
            <p className="mt-1 text-blue-100">Last updated: {lastUpdated}</p>
          </div>

          <div className="px-6 py-8 grid md:grid-cols-2 gap-8">
            {mainSections.map((section, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3">
                  {section.icon &&
                    React.cloneElement(section.icon, {
                      className: "text-primary text-lg",
                    } as any)}
                  <a
                    href={section.href}
                    className="text-xl font-semibold text-primary hover:text-primary/80 hover:underline"
                  >
                    {section.title}
                  </a>
                </div>

                {section.subsections && (
                  <ul className="ml-8 space-y-3 border-l-2 border-blue-100 pl-4">
                    {section.subsections.map((subsection, subIndex) => (
                      <li key={subIndex}>
                        <div className="space-y-2">
                          <a
                            href={subsection.href}
                            className="text-lg text-secondary/80 hover:text-secondary hover:underline flex items-center gap-2"
                          >
                            {subsection.title}
                          </a>
                          {subsection.children && (
                            <ul className="ml-4 space-y-1.5">
                              {subsection.children.map((child, childIndex) => (
                                <li key={childIndex}>
                                  <a
                                    href={child.href}
                                    className="text-base text-secondary/80 hover:text-secondary hover:underline flex items-center gap-2"
                                  >
                                    <span className="text-xs">•</span>{" "}
                                    {child.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <a
              href="/search"
              className="text-gray-500 hover:underline flex items-center gap-2"
            >
              <FaSearch /> Try our search page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
