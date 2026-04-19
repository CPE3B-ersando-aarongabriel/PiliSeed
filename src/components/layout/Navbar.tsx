"use client";
import Link from "next/link";
import { JSX, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/", active: true, width: "w-[43.72px]" },
  { label: "Features", href: "/features", active: false, width: "w-[65.09px]" },
  { label: "How It Works", href: "/how-it-works", active: false, width: "w-[95px]" },
  { label: "About Us", href: "/about", active: false, width: "w-[67.59px]" },
];

export const Navbar = (): JSX.Element => {
  const pathname = usePathname();
  
  const pathToLabel: Record<string, string> = {
    "/": "Home",
    "/features": "Features",
    "/how-it-works": "How It Works",
    "/about": "About Us",
  };

  const [activeNav, setActiveNav] = useState(() => pathToLabel[pathname] || "Home");

  useEffect(() => {
    setActiveNav(pathToLabel[pathname] || "Home");
  }, [pathname]);

  return (
    <nav className="flex w-full h-20 items-center justify-between px-8 py-0 fixed top-0 left-0 z-50 bg-[#f5fcedb2] backdrop-blur-[32px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(32px)_brightness(100%)]">
      <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
        <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-2xl tracking-[-1.20px] leading-8 whitespace-nowrap">
          PiliSeed
        </div>
      </div>

      <div className="inline-flex items-center gap-8 relative flex-[0_0_auto]">
        {navLinks.map((link) => (
          <Link key={link.label} href={link.href}>
            <button
              onClick={() => setActiveNav(link.label)}
              className={`all-[unset] box-border inline-flex flex-col items-start relative flex-[0_0_auto] cursor-pointer ${
                activeNav === link.label
                  ? "border-b-2 [border-bottom-style:solid] border-[#00450d]"
                  : ""
              }`}
            >
              <div
                className={`relative flex items-center ${link.width} h-6 [font-family:'Manrope-Bold',Helvetica] font-bold text-base tracking-[-0.40px] leading-6 whitespace-nowrap ${
                  activeNav === link.label
                    ? "mt-[-2.00px] text-[#00450d]"
                    : "mt-[-1.00px] text-[#171d1499]"
                }`}
              >
                {link.label}
              </div>
            </button>
          </Link>
        ))}
      </div>

      <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
        <Link href="/login">
        <button className="all-[unset] box-border px-6 py-2 inline-flex flex-col rounded-full shadow-[0px_1px_2px_#0000000d] items-center justify-center relative flex-[0_0_auto] border border-solid border-[#00450d] hover:shadow-[inset_0_0_0_2px_#00450d] cursor-pointer transition-all">
          <div className="w-[62px] h-6 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-base leading-6 relative flex items-center justify-center text-center tracking-[0] whitespace-nowrap">
            Sign In
          </div>
        </button>
        </Link>
        <Link href="/signup">
        <button className="all-[unset] box-border px-6 py-2 bg-[#00450d] rounded-full shadow-[0px_1px_2px_#0000000d] inline-flex flex-col items-center justify-center relative flex-[0_0_auto] hover:shadow-[inset_0_0_0_2px_#38873A] cursor-pointer transition-all">
          <div className="relative flex items-center justify-center h-6 mt-[-1.00px] w-[62px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#f5fced] text-base text-center tracking-[0] leading-6 whitespace-nowrap">
            Sign Up
          </div>
        </button>
        </Link>
      </div>
    </nav>
  );
};
