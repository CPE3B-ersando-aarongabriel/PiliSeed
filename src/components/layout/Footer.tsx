
"use client";

import { JSX } from "react";
import Link from "next/link";

const platformLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
];
const contactInfo = ["piliseed.ph@gmail.com", "+63 969 641 0409"];

interface FooterProps {
  absolute?: boolean;
}

export const Footer = ({ absolute = false }: FooterProps): JSX.Element => {
  const positionClass = absolute
    ? "absolute w-full top-[4800px] left-0"
    : "relative w-full";

  return (
    <footer className={`${positionClass} flex bg-[#f5fced] border-t [border-top-style:solid] [border-right-style:none] [border-bottom-style:none] [border-left-style:none] border-[#c0c9bb1a] min-h-[381px] justify-center`}>
      <div className="grid mt-[81px] pb-20 h-auto max-w-full w-full px-4 sm:px-8 mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 lg:gap-20 max-w-7xl">
        <div className="w-full h-fit flex flex-col items-start gap-[23.1px]">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-2xl tracking-[0] leading-8">
              PiliSeed
            </div>
          </div>

          <div className="flex flex-col items-start pt-0 pb-[0.88px] px-0 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#171d1480] text-sm tracking-[0] leading-[22.8px]">
              Cultivating the future of agriculture through data-driven
              intelligence and organic innovation.
            </p>
          </div>

          <div className="flex items-center gap-4 relative self-stretch w-fit flex-[0_0_auto]">
            <button 
              onClick={() => {
                navigator.clipboard.writeText("https://piliseed.com");
              }}
              className="flex w-8 h-8 items-center justify-center rounded-full bg-grey hover:bg-[#E3EBDC] transition-colors cursor-pointer" 
              aria-label="Copy website link"
              title="Copy link to clipboard"
            >
              <img src="/Footer_2.svg" alt="Copy link" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="w-full h-fit flex flex-col items-start gap-4 pt-0 pb-[51px] px-0">
          <div className="flex flex-col items-start pt-0 pb-2 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-xs tracking-[1.20px] leading-4">
                PLATFORM
              </div>
            </div>
          </div>

          {platformLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
            >
              <div className="[font-family:'Inter-Regular',Helvetica] font-normal text-[#171d1480] hover:text-[#171d14] text-sm tracking-[0] leading-5 relative flex items-center self-stretch mt-[-1.00px] cursor-pointer transition-colors">
                {link.label}
              </div>
            </Link>
          ))}
        </div>

        <div className="w-full h-fit flex flex-col items-start gap-4 pt-0 pb-[39px] px-0">
          <div className="flex flex-col items-start pt-0 pb-2 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="[font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-xs tracking-[1.20px] leading-4 relative flex items-center self-stretch mt-[-1.00px]">
                CONTACT
              </div>
            </div>
          </div>

          {contactInfo.map((info) => (
            <div
              key={info}
              className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
            >
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#171d1480] text-sm tracking-[0] leading-5">
                {info}
              </div>
            </div>
          ))}

          <div className="relative self-stretch w-full h-[68px]" />

          <p className="relative flex items-center w-full max-w-xs h-5 [font-family:'Inter-Regular',Helvetica] font-normal text-[#171d1480] text-sm tracking-[0] leading-5">
            © 2024 PiliSeed. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
