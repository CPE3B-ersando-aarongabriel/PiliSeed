"use client";

import { motion } from "framer-motion";
import { JSX } from "react";

const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const Hero_features = (): JSX.Element => {
  return (
    <div className="pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-8">
      <motion.div
        className="mx-auto grid w-full max-w-[1216px] grid-cols-1 gap-8 lg:grid-cols-12 lg:grid-rows-[478.66px] lg:gap-12 relative"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
      <motion.div
        className="relative col-span-1 lg:row-[1_/_2] lg:col-[1_/_8] self-center w-full h-fit flex flex-col items-start gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="inline-flex items-start px-4 py-1.5 relative flex-[0_0_auto] bg-[#e3ebdc] rounded-full">
          <div className="relative flex items-center w-[140.22px] h-5 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#00450d] text-sm tracking-[1.40px] leading-5 whitespace-nowrap">
            OUR ECOSYSTEM
          </div>
        </div>

        <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
          <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-transparent text-4xl leading-tight sm:text-6xl sm:leading-[62px] lg:text-7xl lg:leading-[72px]">
            <span className="text-[#00450d] tracking-[-2.59px]">
              The Future of
              <br />
            </span>

            <span className="text-[#065f18] tracking-[0]">
              Precision
              <br />
              Agriculture.
            </span>
          </p>
        </div>

        <div className="flex flex-col max-w-xl w-full items-start pt-2 pb-0 px-0 relative flex-[0_0_auto]">
          <p className="relative w-full mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-base tracking-[0] leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-[32.5px]">
            PiliSeed integrates satellite intelligence with ground-level soil
            <br />
            data to create a high-fidelity roadmap for your farm&#39;s
            <br />
            success.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="relative col-span-1 lg:row-[1_/_2] lg:col-[8_/_13] self-center w-full h-[280px] sm:h-[360px] lg:h-full flex flex-col items-center justify-center bg-[#ffffff01] rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-[0px_25px_50px_-12px_#00000040]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img 
          src="/features/Hero_features.png" 
          alt="Features" 
          className="w-full h-full rounded-[32px] lg:rounded-[48px] object-cover"
          initial={{ scale: 1.06 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="absolute w-full h-full top-0 left-0 bg-[linear-gradient(0deg,rgba(0,69,13,0.4)_0%,rgba(0,69,13,0)_100%)] rounded-[32px] lg:rounded-[48px]" />
      </motion.div>
      </motion.div>
    </div>
  );
};
