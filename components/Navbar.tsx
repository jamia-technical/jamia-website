"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import MobNav from "./MobNav";
import { 
  MdKeyboardArrowDown, 
  MdKeyboardArrowRight,
  MdHome,
  MdInfo,
  MdSchool,
  MdLocationOn,
  MdPeople,
  MdNewspaper,
  MdContactMail,
  MdDashboard
} from "react-icons/md";
import { NavItem } from "../types";

export default function Navbar() {

  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we're on a news detail page
  const isNewsDetailPage = pathname === "/news/[slug]";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.dropdown-trigger')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Navigation items with icons
  const navItems: NavItem[] = [
    { label: "Home", href: "/", type: "link"},
    {
      label: "About",
      type: "dropdown-about",
      activePaths: [
        "/about",
        "/leadership/Senate",
        "/leadership/Academic",
        "/leadership/Exicutive",
        "/leadership/Finance",
      ],
      items: [{ label: "Overview", href: "/about"}],
      subDropdown: {
        label: "Leadership",
        activePaths: [
          "/leadership/Senate",
          "/leadership/Academic",
          "/leadership/Exicutive",
          "/leadership/Finance",
        ],
        items: [
          { label: "Senate", href: "/leadership/Senate"},
          { label: "Academic Council", href: "/leadership/Academic"},
          { label: "Executive Council", href: "/leadership/Exicutive"},
          { label: "Finance Committee", href: "/leadership/Finance"},
        ],
      },
    },
    {
      label: "Programmes",
      href: "/Programmes",
      type: "dropdown",
      items: [
        { label: "Junior School", href: "/Programmes/Hs"},
        { label: "Senior School", href: "/Programmes/Hss"},
        { label: "Graduate School", href: "/Programmes/Bs"},
        { label: "Finishing School", href: "/Programmes/finishing"},
        { label: "Rabbani Finishing School", href: "/Programmes/rabbani"},
      ],
    },
    {
      label: "Campuses",
      href: "/Programmes",
      type: "dropdown",
      items: [
        { label: "On-Campuses", href: "/campuses/OnCampuses"},
        { label: "Junior Schools", href: "/campuses/JuniorSchools"},
        { label: "Open Schools", href: "/campuses/OpenSchools"},
        { label: "Interstate Campuses", href: "/campuses/Interstate"},
      ],
    },
    {
      label: "Staff Panel",
      href: "https://manager.jamiamadeenathunnoor.org/",
      type: "external",
    },
    { label: "Alumni", href: "/alumni", type: "link"},
    {
      label: "Updates",
      type: "dropdown",
      activePaths: ["/newses", "/publication"],
      items: [
        { label: "News", href: "/newses" },
        { label: "Publications", href: "/publication" },
      ],
    },
    { label: "Contact", href: "/contact", type: "link"},
  ];

  const isActive = (path?: string) => pathname === path;
  const isItemActive = (item: NavItem) =>
    isActive(item.href) ||
    item.activePaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  // Modern dropdown component
  const ModernDropdown = ({ item, isOpen, onMouseEnter, onMouseLeave }: any) => (
    <div 
      className="relative dropdown-trigger"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        className={clsx(
          "flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
          "hover:bg-white/10 group",
          (isOpen || isItemActive(item)) && "bg-white/10"
        )}
      >
        {item.icon && <item.icon className="text-lg" />}
        <span className="font-medium">{item.label}</span>
        <MdKeyboardArrowDown 
          className={clsx(
            "transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="p-2">
            {item.items?.map((subItem: any) => (
              <Link key={subItem.href} href={subItem.href}>
                <div className={clsx(
                  "px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer",
                  "hover:bg-gray-50",
                  (isActive(subItem.matchPath || subItem.href) ||
                    pathname.startsWith(`${subItem.href}/`)) &&
                    "bg-primary/10"
                )}>
                  <p className="font-medium text-gray-900">{subItem.label}</p>
                  {subItem.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{subItem.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Modern About dropdown with nested menu
  const ModernAboutDropdown = ({ item, isOpen, onMouseEnter, onMouseLeave }: any) => (
    <div 
      className="relative dropdown-trigger"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        className={clsx(
          "flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
          "hover:bg-white/10 group",
          isOpen && "bg-white/10"
        )}
      >
        {item.icon && <item.icon className="text-lg" />}
        <span className="font-medium">{item.label}</span>
        <MdKeyboardArrowDown 
          className={clsx(
            "transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="grid md:grid-cols-2">
            {/* Left column - Overview */}
            <div className="p-4 bg-gray-50">
              <Link href="/about">
                <div className="cursor-pointer">
                  <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-sm text-gray-600">Learn about our institution&apos;s mission, vision, and rich history</p>
                </div>
              </Link>
            </div>

            {/* Right column - Leadership dropdown */}
            <div className="p-4">
              <div className="relative group/leadership">
                <div className="flex items-center justify-between cursor-pointer">
                  <h3 className="font-semibold text-gray-900">Leadership</h3>
                  <MdKeyboardArrowRight className="text-gray-400 group-hover/leadership:translate-x-1 transition-transform" />
                </div>
                <div className="mt-3 space-y-2">
                  {item.subDropdown.items.map((subItem: any) => (
                    <Link key={subItem.href} href={subItem.href}>
                      <div className={clsx(
                        "px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer",
                        "hover:bg-gray-100",
                        isActive(subItem.href) && "bg-primary/10"
                      )}>
                        <p className="text-sm font-medium text-gray-900">{subItem.label}</p>
                        {subItem.description && (
                          <p className="text-xs text-gray-500">{subItem.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Simple link component
  const SimpleLink = ({ item }: any) => (
    <Link href={item.href || "#"}>
      <div className={clsx(
        "flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
        "hover:bg-white/10 cursor-pointer group",
        isActive(item.href) && "bg-white/10"
      )}>
        {item.icon && <item.icon className="text-lg" />}
        <span className="font-medium">{item.label}</span>
        {isActive(item.href) && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-secondary rounded-full" />
        )}
      </div>
    </Link>
  );

  // External link component
  const ExternalLink = ({ item }: any) => (
    <a href={item.href} target="_blank" rel="noopener noreferrer">
      <div className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 cursor-pointer group">
        {item.icon && <item.icon className="text-lg" />}
        <span className="font-medium">{item.label}</span>
      </div>
    </a>
  );

  const renderNavItem = (item: NavItem) => {
    const isOpen = activeDropdown === item.label;
    const handlers = {
      onMouseEnter: () => handleDropdownEnter(item.label),
      onMouseLeave: handleDropdownLeave
    };

    switch (item.type) {
      case "link":
        return <SimpleLink key={item.label} item={item} />;
      case "external":
        return <ExternalLink key={item.label} item={item} />;
      case "dropdown-about":
        return <ModernAboutDropdown key={item.label} item={item} isOpen={isOpen} {...handlers} />;
      case "dropdown":
        return <ModernDropdown key={item.label} item={item} isOpen={isOpen} {...handlers} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div
        className={clsx(
          "hidden lg:block fixed top-3 left-0 w-full z-50 transition-all duration-300",
          scrolled ? "py-2" : "py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div
            className={clsx(
              "flex items-center justify-between transition-all duration-300 rounded-2xl",
              scrolled 
                ? "bg-gray-900/95 backdrop-blur-xl shadow-lg" 
                : isNewsDetailPage 
                  ? "bg-gray-900/80 backdrop-blur-md" 
                  : "bg-black/20 backdrop-blur-md",
              "px-6 py-2"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="relative h-12 w-32 transition-transform duration-300 hover:scale-105">
                <Image
                  src="/images/logo horizontal white.svg"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1 text-white">
              {navItems.map((item) => renderNavItem(item))}
            </div>

            {/* CTA Button */}
            {/* <Link href="/admissions">
              <button className="px-6 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                Apply Now
              </button>
            </Link> */}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobNav />
    </>
  );
}
