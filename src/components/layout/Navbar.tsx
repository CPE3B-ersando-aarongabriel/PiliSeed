"use client";
import Link from "next/link";
import { JSX, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", active: true, width: "w-[43.72px]" },
  { label: "Features", href: "/features", active: false, width: "w-[65.09px]" },
  { label: "How It Works", href: "/how-it-works", active: false, width: "w-[95px]" },
  { label: "About Us", href: "/about", active: false, width: "w-[67.59px]" },
];

export const Navbar = (): JSX.Element => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pathToLabel: Record<string, string> = {
    "/": "Home",
    "/features": "Features",
    "/how-it-works": "How It Works",
    "/about": "About Us",
  };

  const activeNav = pathToLabel[pathname] || "Home";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="flex w-full h-20 items-center justify-between px-4 sm:px-6 lg:px-8 py-0 fixed top-0 left-0 z-50 bg-[#f5fcedb2] backdrop-blur-[32px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(32px)_brightness(100%)] overflow-x-hidden">
        <div className="inline-flex items-center gap-2 relative flex-[0_0_auto] min-w-fit">
          <img
            src="/Pili-logo-main.png"
            alt="PiliSeed logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
          />
          <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-xl sm:text-2xl tracking-[-1.20px] leading-8 whitespace-nowrap">
            PiliSeed
          </div>
        </div>

        <div className="hidden md:inline-flex items-center gap-4 lg:gap-8 relative flex-[0_0_auto]">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              <button
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

        <div className="hidden md:inline-flex items-center gap-2 sm:gap-4 relative flex-[0_0_auto] ml-auto md:ml-0">
          <Link href="/login">
            <button className="all-[unset] box-border px-4 sm:px-6 py-2 inline-flex flex-col rounded-full shadow-[0px_1px_2px_#0000000d] items-center justify-center relative flex-[0_0_auto] border border-solid border-[#00450d] hover:shadow-[inset_0_0_0_2px_#00450d] cursor-pointer transition-all">
              <div className="w-auto h-6 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-sm sm:text-base leading-6 relative flex items-center justify-center text-center tracking-[0] whitespace-nowrap">
                Log in
              </div>
            </button>
          </Link>
          <Link href="/signup">
            <button className="all-[unset] box-border px-4 sm:px-6 py-2 bg-[#00450d] rounded-full shadow-[0px_1px_2px_#0000000d] inline-flex flex-col items-center justify-center relative flex-[0_0_auto] hover:shadow-[inset_0_0_0_2px_#38873A] cursor-pointer transition-all">
              <div className="relative flex items-center justify-center h-6 mt-[-1.00px] w-auto [font-family:'Manrope-Bold',Helvetica] font-bold text-[#f5fced] text-sm sm:text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                Sign Up
              </div>
            </button>
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2 ml-auto">
          <Link href="/login">
            <button className="all-[unset] box-border px-3 py-2 inline-flex flex-col rounded-full shadow-[0px_1px_2px_#0000000d] items-center justify-center relative flex-[0_0_auto] border border-solid border-[#00450d] cursor-pointer transition-all">
              <div className="w-auto h-5 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-xs leading-5 relative flex items-center justify-center text-center tracking-[0] whitespace-nowrap">
                Log in
              </div>
            </button>
          </Link>
          <Link href="/signup">
            <button className="all-[unset] box-border px-3 py-2 bg-[#00450d] rounded-full shadow-[0px_1px_2px_#0000000d] inline-flex flex-col items-center justify-center relative flex-[0_0_auto] cursor-pointer transition-all">
              <div className="relative flex items-center justify-center h-5 mt-[-1.00px] w-auto [font-family:'Manrope-Bold',Helvetica] font-bold text-[#f5fced] text-xs text-center tracking-[0] leading-5 whitespace-nowrap">
                Sign Up
              </div>
            </button>
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#00450d] text-[#00450d]"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="md:hidden fixed inset-0 z-40 cursor-default bg-black/10"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="md:hidden fixed inset-x-0 top-20 z-50 border-t border-[#c0c9bb4c] bg-[#f5fcedf2] backdrop-blur-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-2 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    activeNav === link.label
                      ? "bg-[#e3ebdc] text-[#00450d]"
                      : "text-[#171d14] hover:bg-[#e3ebdc]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-[#c0c9bb66] pt-2" />
            </div>
          </div>
        </>
      )}
    </>
  );
};
