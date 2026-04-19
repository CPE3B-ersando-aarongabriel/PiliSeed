"use client";
import { JSX } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export const Hero = (): JSX.Element => {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 80]);
  const bgScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.08]);

  return (
    <motion.div
      className="absolute w-full top-20 left-0 h-[1235px]"
      style={{ y: heroY }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute top-[29px] left-0 w-full h-[1176px] opacity-90 bg-[url(/landing/Hero.png)] bg-cover bg-[50%_50%]"
        style={{ scale: bgScale }}
      />

      <motion.div
        className="absolute w-[calc(100%_-_32px)] top-[calc(50.00%_-_392px)] left-4 h-[572px] flex"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mt-[-0.1px] h-[572px] ml-8 mr-[648px] flex-1 flex flex-col">
          <div className="inline-flex w-[246.42px] h-9 relative items-start px-4 py-2 bg-[#a3f69c] rounded-full">
            <div className="relative flex items-center w-[214.42px] h-5 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#002204] text-sm tracking-[1.40px] leading-5 whitespace-nowrap">
              DIGITAL GREENHOUSE V2.0
            </div>
          </div>

          <div className="flex flex-1 max-h-[390px] relative mt-6 flex-col w-[568px] items-start">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-transparent text-7xl leading-[72px]">
              <span className="text-[#171d14] tracking-[-2.59px]">
                Empowering
                <br />
                Farmers with
                <br />
              </span>

              <span className="text-[#00450d] tracking-[0]">
                Smarter Data-
                <br />
                Driven
              </span>

              <span className="text-[#171d14] tracking-[-2.59px]">
                {" "}
                Decisions.
              </span>
            </p>
          </div>

          <div className="flex mr-14 flex-1 max-h-24 relative mt-[26.1px] flex-col max-w-lg w-[512px] items-start pt-2 pb-0 px-0">
            <p className="relative w-[505.17px] h-[88px] mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[29.2px]">
              Transform your agricultural legacy with real-time soil
              <br />
              analysis, hyper-local weather intelligence, and AI-powered
              <br />
              yield predictions tailored for your soil&#39;s unique DNA.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex w-[calc(100%_-_712px)] h-20 items-start gap-4 pt-4 pb-0 px-0 absolute top-[840px] left-12">
        <Link href="/signup">
          <motion.button
            className="all-[unset] box-border px-10 py-4 bg-white rounded-full border-2 border-solid border-[#00450d1a] inline-flex flex-col items-center justify-center relative flex-[0_0_auto] cursor-pointer"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 20 }}
          >
            <div className="relative flex items-center justify-center w-[80.91px] h-7 [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-lg text-center tracking-[0] leading-7 whitespace-nowrap">
              Get Started
            </div>
          </motion.button>
        </Link>

        <Link href="/demo">
          <motion.button
            className="all-[unset] box-border px-10 py-4 bg-white rounded-full border-2 border-solid border-[#00450d1a] inline-flex flex-col items-center justify-center relative flex-[0_0_auto] cursor-pointer"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 20 }}
          >
            <div className="relative flex items-center justify-center w-[80.91px] h-7 [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-lg text-center tracking-[0] leading-7 whitespace-nowrap">
              Try Demo
            </div>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};
