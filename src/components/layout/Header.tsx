import Link from "next/link";
import { JSX } from "react";

export const Header = (): JSX.Element => {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center px-4 sm:px-6 lg:px-8 py-0 bg-[#f5fcedb2] backdrop-blur-[32px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(32px)_brightness(100%)]">
      <div className="flex h-20 w-full max-w-screen-2xl items-center justify-between gap-4">
        <Link href="/" className="inline-flex flex-col items-start relative flex-[0_0_auto]">
          <span className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-xl sm:text-2xl tracking-[-1.20px] leading-8 whitespace-nowrap cursor-pointer">
            PiliSeed
          </span>
        </Link>
        <div className="inline-flex items-center gap-2 sm:gap-4 relative flex-[0_0_auto]">
          <Link href="/signup" className="all-[unset] box-border inline-flex flex-col items-center justify-center rounded-full border border-solid border-[#00450d] px-4 sm:px-6 py-2 shadow-[0px_1px_2px_#0000000d] hover:shadow-[inset_0_0_0_2px_#00450d] cursor-pointer transition-all">
            <span className="relative flex h-6 w-auto items-center justify-center text-center [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap mt-[-1.00px]">
              Sign Up
            </span>
          </Link>
          <Link href="/login" className="all-[unset] box-border inline-flex flex-col items-center justify-center rounded-full bg-[#00450d] px-4 sm:px-6 py-2 shadow-[0px_1px_2px_#0000000d] hover:shadow-[inset_0_0_0_2px_#38873A] cursor-pointer transition-all">
            <span className="relative flex h-6 w-auto items-center justify-center text-center [font-family:'Manrope-Bold',Helvetica] font-bold text-[#f5fced] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap mt-[-1.00px]">
              Get Started
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
