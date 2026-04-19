"use client";

import { motion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { JSX, useRef } from "react";

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const soilFields = [
  { label: "Soil pH Level", value: "6.5" },
  { label: "Nitrogen (N)", value: "Medium" },
  { label: "Phosphorus (P)", value: "Low" },
  { label: "Moisture Content", value: "24%" },
];

const recommendationCards = [
  {
    icon: "/how-it-works/HIW3.svg",
    iconBg: "bg-[#00450d]",
    iconClass: "relative w-[17px] h-[16.99px]",
    title: "Crop Selection",
    titleWidth: "w-[113.77px]",
    desc: "Optimal yield predictions for 50+ crops.",
    descWidth: "w-[261.86px]",
  },
  {
    icon: "/how-it-works/HIW4.svg",
    iconBg: "bg-[#003e63]",
    iconClass: "relative w-4 h-5",
    title: "Irrigation Cycles",
    titleWidth: "w-[126.91px]",
    desc: "Precision scheduling based on evapotranspiration.",
    descWidth: "w-[334.06px]",
  },
];

const forecastCards = [
  {
    icon: "/how-it-works/HIW.svg",
    iconClass: "relative w-10 h-6",
    iconBg: "bg-[#a3f69c4c]",
    title: "Growth Forecast",
    titleWidth: "w-[127.62px]",
    subtitle: "CONFIDENCE 94%",
    subtitleWidth: "w-[126.25px]",
    colClass: "col-[1_/_2] w-[336.66px]",
  },
  {
    icon: "/how-it-works/HIW2.svg",
    iconClass: "relative w-[38.02px] h-10",
    iconBg: "bg-[#fdcdbc4c]",
    title: "AI Recommendation",
    titleWidth: "w-[155.47px]",
    subtitle: "READY TO PLANT",
    subtitleWidth: "w-[120.48px]",
    colClass: "col-[2_/_3] w-full",
  },
];

export const HIW_Body = (): JSX.Element => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const progressScale = useSpring(
    useTransform(scrollYProgress, [0.12, 0.95], [0, 1]),
    { stiffness: 130, damping: 30 }
  );
  const heroImageY = useTransform(scrollYProgress, [0, 0.6], [0, -24]);

  return (
    <div ref={sectionRef} className="flex flex-col items-center gap-24 pt-32 pb-24 px-0 relative self-stretch w-full flex-[0_0_auto]">
      <div className="fixed top-20 left-0 z-40 h-1 w-full bg-[#00450d1a] pointer-events-none">
        <motion.div className="h-full origin-left bg-[#00450d]" style={{ scaleX: progressScale }} />
      </div>
      <motion.div
        className="grid grid-cols-2 grid-rows-[432px] w-[1216px] h-fit gap-16"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="relative row-[1_/_2] col-[1_/_2] justify-self-start self-center w-[624px] h-fit flex flex-col items-start gap-6">
          <div className="inline-flex items-start px-4 py-1.5 relative flex-[0_0_auto] bg-[#a3f69c] rounded-full">
            <div className="relative flex items-center w-[172.94px] h-5 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#005312] text-sm tracking-[0.35px] leading-5 whitespace-nowrap">
              THE PILLISEED METHOD
            </div>
          </div>
          <div className="relative self-stretch w-full flex-[0_0_auto] flex flex-col items-start">
            <p className="relative w-[598px] mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-transparent text-7xl leading-[72px]">
              <span className="text-[#00450d] tracking-[-1.30px]">
                From Soil to
                <br />
                Success in{" "}
              </span>
              <span className="text-[#7a5649] tracking-[0]">
                Three
                <br />
                Steps.
              </span>
            </p>
          </div>
          <div className="flex flex-col max-w-xl items-start pt-2 pb-0 px-0 relative w-full flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-xl tracking-[0] leading-[32.5px]">
              We&#39;ve distilled complex agricultural science into a seamless
              <br />
              digital journey. Empower your land with AI-driven insights
              <br />
              that respect the rhythm of nature.
            </p>
          </div>
        </div>
        <div className="relative row-[1_/_2] col-[2_/_3] self-center w-full h-fit flex flex-col items-start">
          <div className="absolute w-[calc(100%_+_32px)] h-[calc(100%_+_32px)] -top-4 -left-4 bg-[#00450d0d] rounded-[48px] blur-[32px]" />
          <div className="flex flex-col items-start justify-center relative self-stretch flex-[0_0_auto] rounded-[48px] overflow-hidden shadow-[0px_25px_50px_-12px_#00000040] aspect-[1.33] w-full bg-[#ffffff01]">
            <motion.div
              className="relative self-stretch w-full h-[432px] bg-[url(/how-it-works/HIW.png)] bg-cover bg-[50%_50%]"
              style={{ y: heroImageY }}
            />
          </div>
        </div>
      </motion.div>
      <div className="flex flex-col items-center gap-32 pt-0 pb-24 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <motion.div
          className="grid grid-cols-12 grid-rows-[401.73px] w-[1216px] h-fit gap-12"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="relative row-[1_/_2] col-[1_/_6] self-center w-full h-fit flex flex-col items-start gap-6">
            <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <motion.div
                className="flex w-12 h-12 items-center justify-center pt-[7.5px] pb-[8.5px] px-0 relative bg-[#00450d] rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative flex items-center justify-center w-[10.91px] h-8 mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-white text-2xl text-center tracking-[0] leading-8 whitespace-nowrap">
                  1
                </div>
              </motion.div>
              <div className="relative flex-1 grow h-px bg-[#c0c9bb4c]" />
            </div>
            <div className="relative self-stretch w-full flex-[0_0_auto] flex flex-col items-start">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-4xl tracking-[0] leading-10">
                Pinpoint Your Farm
              </div>
            </div>
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-lg tracking-[0] leading-[29.2px]">
                Start by locating your field on our high-resolution
                <br />
                satellite map. Our system automatically identifies
                <br />
                climate zones and historical weather patterns specific
                <br />
                to your coordinates.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex flex-col items-start pt-1 pb-0 px-0 relative flex-[0_0_auto]">
                  <img className="relative w-4 h-5" 
                  alt="Icon" 
                  src="/how-it-works/HIW6.svg" 
                  />
                </div>
                <p className="w-[343px] h-6 mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#171d14] text-base tracking-[0] leading-6 relative flex items-center whitespace-nowrap">
                  Precision geolocation up to 1 meter accuracy.
                </p>
              </div>
              <div className="flex items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex flex-col items-start pt-1 pb-0 px-0 relative flex-[0_0_auto]">
                  <img
                    className="relative w-[18px] h-[19.05px]"
                    alt="Icon"
                    src="/how-it-works/HIW7.svg"
                  />
                </div>
                <div className="w-[303.25px] h-6 mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#171d14] text-base tracking-[0] leading-6 relative flex items-center whitespace-nowrap">
                  Automatic regional topography analysis.
                </div>
              </div>
            </div>
          </div>
          <div className="relative row-[1_/_2] col-[6_/_13] self-center w-full h-fit flex flex-col items-start p-4 bg-[#e3ebdc] rounded-[48px] overflow-hidden shadow-[0px_1px_2px_#0000000d]">
            <div className="flex flex-col items-start justify-center relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff33] rounded-[32px] overflow-hidden bg-blend-saturation aspect-[1.78]">
              <div className="relative self-stretch w-full h-[369.73px] bg-[url(/how-it-works/HIW2.png)] bg-cover bg-[50%_50%]" />
              <div className="absolute w-full h-full top-0 left-0 rounded-[32px] border-[6px] border-solid border-[#00450d66]" />
            </div>
            <div className="inline-flex flex-col items-start gap-2 p-4 absolute top-8 right-8 bg-[#ffffff66] rounded-[32px] backdrop-blur-md backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(12px)_brightness(100%)]">
              <div className="absolute h-full top-0 left-0 rounded-[32px] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] w-full bg-[#ffffff01]" />
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <div className="w-[108.7px] h-4 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#00450d] text-xs tracking-[1.20px] leading-4 relative flex items-center whitespace-nowrap">
                  ACTIVE REGION
                </div>
              </div>
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <div className="w-[144.86px] h-7 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#171d14] text-lg tracking-[0] leading-7 relative flex items-center whitespace-nowrap">
                  Valley Plot #402
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="flex flex-col items-center px-8 py-32 relative self-stretch w-full flex-[0_0_auto] bg-[#eff6e7]"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="grid grid-cols-12 grid-rows-[351.75px] w-[1216px] h-fit gap-12">
            <div className="relative row-[1_/_2] col-[1_/_8] self-center w-full h-fit flex flex-col items-start gap-8 p-8 bg-white rounded-[48px] border border-solid border-[#c0c9bb1a]">
              <div className="absolute h-full top-0 left-0 rounded-[48px] shadow-[0px_8px_10px_-6px_#0000001a,0px_20px_25px_-5px_#0000001a] w-full bg-[#ffffff01]" />
              <div className="grid w-full grid-cols-2 gap-6">
                {soilFields.map((field, index) => {
                  return (
                    <motion.div
                      key={field.label}
                      className="flex flex-col gap-2"
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                        {field.label}
                      </div>
                      <div className="flex min-h-14 items-center px-6 py-4 bg-[#e3ebdc] rounded-md overflow-hidden">
                        <div className="[font-family:'Inter-Regular',Helvetica] font-normal text-gray-500 text-base tracking-[0] leading-6">
                          {field.value}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <button className="all-[unset] box-border flex gap-2 px-0 py-4 self-stretch w-full bg-[#00450d] rounded-full items-center justify-center relative flex-[0_0_auto]">
                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-full shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a]" />
                <div className="justify-center w-[148.36px] h-6 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-white text-base text-center tracking-[0] leading-6 relative flex items-center whitespace-nowrap">
                  Analyze Soil Health
                </div>
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <img
                    className="relative w-[18px] h-[18px]"
                    alt="Icon"
                    src="/how-it-works/HIW5.svg"
                  />
                </div>
              </button>
            </div>
            <div className="relative row-[1_/_2] col-[8_/_13] self-center w-full h-fit flex flex-col items-start gap-6">
              <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <motion.div
                  className="flex w-12 h-12 items-center justify-center pt-[7.5px] pb-[8.5px] px-0 relative bg-[#7a5649] rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-[14.5px] relative flex items-center justify-center h-8 mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-white text-2xl text-center tracking-[0] leading-8 whitespace-nowrap">
                    2
                  </div>
                </motion.div>
                <div className="relative flex-1 grow h-px bg-[#c0c9bb4c]" />
              </div>
              <div className="items-start flex flex-col relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-4xl tracking-[0] leading-10">
                  Input Soil Data
                </div>
              </div>
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-lg tracking-[0] leading-[29.2px]">
                  Don&#39;t let your data go to waste. Input your latest soil
                  <br />
                  test results or connect your IoT sensors for a real-time
                  <br />
                  stream of vital underground metrics.
                </p>
              </div>
              <div className="flex flex-col items-start pt-8 pb-6 px-6 relative self-stretch w-full flex-[0_0_auto] bg-[#fdcdbc] rounded-[32px]">
                <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                  <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#795548] text-base tracking-[0] leading-6">
                    &#34;The soil is the great connector of lives, the source
                    and
                    <br />
                    destination of all.&#34;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="grid grid-cols-12 grid-rows-[461px] w-[1216px] h-fit gap-12"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="relative row-[1_/_2] col-[1_/_6] self-center w-full h-fit flex flex-col items-start gap-6">
            <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <motion.div
                className="flex w-12 h-12 items-center justify-center pt-[7.5px] pb-[8.5px] px-0 relative bg-[#003e63] rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-[14.19px] relative flex items-center justify-center h-8 mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-white text-2xl text-center tracking-[0] leading-8 whitespace-nowrap">
                  3
                </div>
              </motion.div>
              <div className="relative flex-1 grow h-px bg-[#c0c9bb4c]" />
            </div>
            <div className="items-start flex flex-col relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-4xl tracking-[0] leading-10">
                Receive Recommendations
              </div>
            </div>
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-lg tracking-[0] leading-[29.2px]">
                Our proprietary &#34;Greenhouse AI&#34; processes your data
                <br />
                against thousands of crop varieties to deliver a<br />
                personalized roadmap for planting, irrigation, and
                <br />
                fertilization.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
              {recommendationCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  className="flex items-center gap-4 p-4 relative self-stretch w-full flex-[0_0_auto] bg-[#dee5d6] rounded-[32px]"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className={`${card.iconBg} flex w-12 h-12 items-center justify-center relative rounded-full shadow-[0px_1px_2px_#0000000d]`}
                  >
                    <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                      <img
                        className={card.iconClass}
                        alt="Icon"
                        src={card.icon}
                      />
                    </div>
                  </div>
                  <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                      <div
                        className={`${card.titleWidth} h-6 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#171d14] text-base tracking-[0] leading-6 relative flex items-center whitespace-nowrap`}
                      >
                        {card.title}
                      </div>
                    </div>
                    <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                      <p
                        className={`${card.descWidth} h-5 mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-sm tracking-[0] leading-5 relative flex items-center whitespace-nowrap`}
                      >
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 grid-rows-[238px] h-fit gap-4 relative row-[1_/_2] col-[6_/_13] self-center w-full">
            {forecastCards.map((card) => (
              <div
                key={card.title}
                className={`${card.colClass} relative row-[1_/_2] h-[238px] bg-white rounded-[48px] border border-solid border-[#00450d0d]`}
              >
                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-[48px] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                <div
                  className={`flex w-[calc(100%_-_50px)] h-32 items-center justify-center absolute top-[25px] left-[25px] ${card.iconBg} rounded-[32px]`}
                >
                  <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <img
                      className={card.iconClass}
                      alt="Icon"
                      src={card.icon}
                    />
                  </div>
                </div>
                <div className="w-[calc(100%_-_50px)] absolute top-[169px] left-[25px] flex flex-col items-start">
                  <div
                    className={`${card.titleWidth} h-6 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#00450d] text-base tracking-[0] leading-6 relative flex items-center whitespace-nowrap`}
                  >
                    {card.title}
                  </div>
                </div>
                <div className="flex flex-col w-[calc(100%_-_50px)] items-start absolute top-[197px] left-[25px]">
                  <div
                    className={`${card.subtitleWidth} h-4 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-xs tracking-[1.20px] leading-4 relative flex items-center whitespace-nowrap`}
                  >
                    {card.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
