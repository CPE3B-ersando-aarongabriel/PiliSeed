"use client";
import { JSX } from "react";
import { motion } from "framer-motion";

interface EncouragementProps {
  absolute?: boolean;
  className?: string;
}

export const Encouragement = ({ absolute = false, className = "" }: EncouragementProps): JSX.Element => {
  const positionClass = absolute
    ? "absolute top-[4120px] left-8"
    : "relative mx-8";
  
  return (
    <motion.div
      className={`flex w-[calc(100%_-_64px)] min-h-[500px] items-center justify-center px-12 py-[90.5px] ${positionClass} rounded-[48px] overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col w-full h-full items-start justify-center absolute top-0 left-0">
        <div className="relative flex-1 self-stretch w-full grow bg-[url(/Encouragement.png)] bg-cover bg-[50%_50%]" />

        <div className="absolute w-full h-full top-0 left-0 bg-[#00450d66] mix-blend-multiply" />

        <div className="h-full top-0 bg-[linear-gradient(180deg,rgba(0,69,13,0)_0%,rgba(0,69,13,0.2)_50%,rgba(0,69,13,0.8)_100%)] absolute w-full left-0" />
      </div>

      <motion.div
        className="inline-flex flex-col max-w-screen-md items-start gap-8 relative flex-[0_0_auto]"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center self-stretch w-full flex-[0_0_auto] relative flex-col">
          <p className="relative flex items-center justify-center w-[498.18px] h-[120px] mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-white text-6xl text-center tracking-[-3.00px] leading-[60px]">
            Ready to optimize your harvest?
          </p>
        </div>

        <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
          <p className="relative w-[765.58px] h-[65px] mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#a3f69ccc] text-xl text-center tracking-[0] leading-7">
            Join&nbsp;&nbsp;farmers using PiliSeed to bridge the gap between
            <br />
            tradition and technology.
          </p>
        </div>

        <div className="flex items-start justify-center gap-4 pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <motion.button
            className="all-[unset] box-border pt-[16.5px] pb-[17.5px] px-8 bg-white rounded-full inline-flex flex-col items-center justify-center relative flex-[0_0_auto] cursor-pointer"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 20 }}
          >
            <div className="shadow-[0px_25px_50px_-12px_#00000040] absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-full" />

            <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#00450d] text-lg text-center tracking-[0] leading-7 whitespace-nowrap">
              Login
            </div>
          </motion.button>

          <motion.button
            className="all-[unset] box-border px-8 py-4 bg-[#ffffff1a] rounded-full border border-solid border-[#ffffff33] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)] inline-flex flex-col items-center justify-center relative flex-[0_0_auto] cursor-pointer"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 20 }}
          >
            <div className="w-[144.8px] h-7 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-lg leading-7 relative flex items-center justify-center text-center tracking-[0] whitespace-nowrap">
              Sign Up
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
