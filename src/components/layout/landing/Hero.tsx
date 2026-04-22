"use client";
import { JSX, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const textPartContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const textPart = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const Hero = (): JSX.Element => {
  const subtitleText =
    "Transform your agricultural legacy with real-time soil analysis, hyper-local weather intelligence, and AI-powered yield predictions tailored for your soil's unique DNA.";
  const [typedSubtitle, setTypedSubtitle] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedSubtitle(subtitleText.slice(0, index));
      if (index >= subtitleText.length) {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.section
      className="relative w-full min-h-[calc(100svh-5rem)] overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 opacity-90 bg-[url(/landing/Hero.png)] bg-cover bg-[50%_50%]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,69,13,0.15)_0%,rgba(0,69,13,0.5)_55%,rgba(0,69,13,0.82)_100%)]" />

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-16 pb-14 sm:px-8 sm:pt-20 sm:pb-20 lg:items-start lg:pt-24"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex w-full max-w-3xl flex-col items-center text-center lg:items-start lg:text-left">
          <div className="inline-flex h-9 items-center rounded-full bg-[#2f7a33] px-4 py-2">
            <div className="[font-family:'Manrope-Bold',Helvetica] text-xs sm:text-sm font-bold tracking-[1.2px] sm:tracking-[1.4px] leading-5 text-[#ecffe7] whitespace-nowrap">
              AI FARM INTELLIGENCE PLATFORM
            </div>
          </div>

          <motion.div
            className="mt-6 w-full"
            variants={textPartContainer}
            initial="hidden"
            animate="visible"
          >
            <p className="[font-family:'Inter-ExtraBold',Helvetica] text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight sm:leading-[1.08] lg:leading-[72px] text-transparent">
              <motion.span className="text-[#f4fbef] tracking-[-1.8px] sm:tracking-[-2.1px] lg:tracking-[-2.59px] inline-block" variants={textPart}>
                Empowering Farmers with
              </motion.span>{" "}
              <motion.span className="text-[#f4d35e] tracking-[0] inline-block" variants={textPart}>
                Smarter Data-Driven
              </motion.span>{" "}
              <motion.span className="text-[#f4fbef] tracking-[-1.8px] sm:tracking-[-2.1px] lg:tracking-[-2.59px] inline-block" variants={textPart}>
                Decisions.
              </motion.span>
            </p>
          </motion.div>

          <div className="mt-6 w-full max-w-2xl min-h-[172px] sm:min-h-[150px] lg:min-h-[132px]">
            <p className="[font-family:'Inter-Medium',Helvetica] text-[#e6f2e2] text-base sm:text-lg font-medium leading-relaxed tracking-[0]">
              {typedSubtitle}
              <motion.span
                className="inline-block ml-1 w-[2px] h-[1.35em] bg-[#f4d35e] align-[-0.25em]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
            </p>
          </div>

          <div className="mt-3 sm:mt-4 flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start">
            <Link href="/signup" className="w-full sm:w-auto">
              <motion.button
                className="all-[unset] box-border inline-flex w-full sm:w-auto items-center justify-center rounded-full border-2 border-solid border-[#00450d1a] bg-white px-8 py-3.5 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 360, damping: 20 }}
              >
                <div className="[font-family:'Manrope-Bold',Helvetica] text-[#00450d] text-base sm:text-lg font-bold text-center leading-7 whitespace-nowrap">
                  Get Started
                </div>
              </motion.button>
            </Link>

            <Link href="/how-it-works" className="w-full sm:w-auto">
              <motion.button
                className="all-[unset] box-border inline-flex w-full sm:w-auto items-center justify-center rounded-full border-2 border-solid border-[#00450d1a] bg-white px-8 py-3.5 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 360, damping: 20 }}
              >
                <div className="[font-family:'Manrope-Bold',Helvetica] text-[#00450d] text-base sm:text-lg font-bold text-center leading-7 whitespace-nowrap">
                  How It Works
                </div>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};
