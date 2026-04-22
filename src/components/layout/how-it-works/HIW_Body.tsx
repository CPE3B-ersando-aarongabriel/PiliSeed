"use client";

import { motion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { JSX, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Droplets,
  MapPinned,
  Mountain,
  Sprout,
  TrendingUp,
} from "lucide-react";

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const textPartContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const textPart: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const npkPreviewFields = [
  { label: "Nitrogen (N)", value: "18", unit: "mg/kg" },
  { label: "Phosphorus (P)", value: "9", unit: "mg/kg" },
  { label: "Potassium (K)", value: "24", unit: "mg/kg" },
];

const environmentalPreviewFields = [
  { label: "Soil Moisture", value: "24", unit: "%" },
  { label: "Soil pH", value: "6.5", unit: "pH" },
  { label: "Light Level", value: "16800", unit: "lux" },
  { label: "Temperature", value: "29", unit: "°C" },
  { label: "Humidity", value: "67", unit: "%" },
];

const recommendationCards = [
  {
    Icon: Sprout,
    iconBg: "bg-[#00450d]",
    iconClass: "relative w-[17px] h-[16.99px]",
    title: "Crop Selection",
    titleWidth: "w-[113.77px]",
    desc: "Optimal yield predictions for 50+ crops.",
    descWidth: "w-[261.86px]",
  },
  {
    Icon: Droplets,
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
    Icon: TrendingUp,
    iconClass: "relative w-10 h-6",
    iconBg: "bg-[#a3f69c4c]",
    title: "Growth Forecast",
    titleWidth: "w-[127.62px]",
    subtitle: "CONFIDENCE 94%",
    subtitleWidth: "w-[126.25px]",
    colClass: "col-[1_/_2] w-[336.66px]",
  },
  {
    Icon: Bot,
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
  const mobileSubtitleText =
    "A streamlined flow from farm setup, to soil input, to AI recommendations.";
  const desktopSubtitleText =
    "We've distilled complex agricultural science into a seamless digital journey. Empower your land with AI-driven insights that respect the rhythm of nature.";
  const [typedMobileSubtitle, setTypedMobileSubtitle] = useState("");
  const [typedDesktopSubtitle, setTypedDesktopSubtitle] = useState("");

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

  useEffect(() => {
    let mobileIndex = 0;
    const mobileTimer = setInterval(() => {
      mobileIndex += 1;
      setTypedMobileSubtitle(mobileSubtitleText.slice(0, mobileIndex));
      if (mobileIndex >= mobileSubtitleText.length) {
        clearInterval(mobileTimer);
      }
    }, 30);

    return () => clearInterval(mobileTimer);
  }, []);

  useEffect(() => {
    let desktopIndex = 0;
    const desktopTimer = setInterval(() => {
      desktopIndex += 1;
      setTypedDesktopSubtitle(desktopSubtitleText.slice(0, desktopIndex));
      if (desktopIndex >= desktopSubtitleText.length) {
        clearInterval(desktopTimer);
      }
    }, 30);

    return () => clearInterval(desktopTimer);
  }, []);

  return (
    <>
    <div className="flex lg:hidden flex-col gap-8 pt-20 pb-14 px-4 sm:px-8 bg-[#f5fced]">
      <motion.div
        className="mx-auto w-full max-w-3xl space-y-4"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.5 }}
      >
        <span className="inline-flex rounded-full bg-[#a3f69c] px-3 py-1 text-xs font-semibold tracking-[0.35px] text-[#005312]">THE PILLISEED METHOD</span>
        <motion.h1
          className="[font-family:'Inter-ExtraBold',Helvetica] text-4xl font-extrabold leading-tight text-[#00450d] sm:text-5xl"
          variants={textPartContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.65 }}
        >
          <motion.span className="inline-block" variants={textPart}>
            From Soil to Success
            <br />
          </motion.span>
          <motion.span className="inline-block" variants={textPart}>
            in Three Steps.
          </motion.span>
        </motion.h1>
        <p className="[font-family:'Inter-Regular',Helvetica] text-base leading-7 text-[#41493e] min-h-[72px] sm:min-h-[84px]">
          {typedMobileSubtitle}
          <motion.span
            className="inline-block ml-1 w-[2px] h-[1.35em] bg-[#065f18] align-[-0.25em]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        </p>
      </motion.div>

      <motion.div
        className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-5"
        variants={sectionReveal}
        initial={false}
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        <div className="rounded-[20px] border border-[#00450d1a] bg-white px-4 py-3 shadow-[0px_8px_20px_-14px_#00000045]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a3f69c]">
              <Sprout className="h-4 w-4 text-[#00450d]" aria-hidden="true" />
            </div>
            <div>
              <p className="[font-family:'Inter-SemiBold',Helvetica] text-sm font-semibold leading-5 text-[#00450d]">
                Step-by-step crop guidance
              </p>
              <p className="mt-0.5 [font-family:'Inter-Regular',Helvetica] text-xs leading-4 text-[#41493e]">
                Pinpoint farm, input soil data, receive AI recommendations.
              </p>
            </div>
          </div>
        </div>

        <motion.div
          className="rounded-[28px] bg-white p-6 shadow-[0px_10px_24px_-12px_#00000030]"
          variants={sectionReveal}
          initial={false}
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          whileHover={{ scale: 1.015, y: -4 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00450d] text-sm font-extrabold text-white">1</div>
            <div className="h-px flex-1 bg-[#c0c9bb4c]" />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-[#00450d]">Pinpoint Your Farm</h2>
          <p className="mt-2 text-sm leading-6 text-[#41493e]">
            Start by locating your field on our high-resolution satellite map. Our system automatically identifies climate zones and historical weather patterns specific to your coordinates.
          </p>

          <div className="mt-4 space-y-2 text-sm text-[#171d14]">
            <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-[#00450d]" /> Precision geolocation up to 1 meter accuracy.</div>
            <div className="flex items-center gap-2"><Mountain className="h-4 w-4 text-[#00450d]" /> Automatic regional topography analysis.</div>
          </div>

          <div className="mt-5 relative overflow-hidden rounded-[20px] border-4 border-[#00450d66] bg-[url(/how-it-works/HIW2.png)] bg-cover bg-[50%_50%] aspect-[16/10]">
            <div className="absolute right-3 top-3 rounded-2xl bg-[#ffffffcc] px-3 py-2 backdrop-blur-[8px]">
              <p className="text-[10px] font-semibold tracking-[1.1px] text-[#00450d]">ACTIVE REGION</p>
              <p className="text-sm font-bold text-[#171d14]">Valley Plot #402</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-[28px] bg-white p-6 shadow-[0px_10px_24px_-12px_#00000030]"
          variants={sectionReveal}
          initial={false}
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          whileHover={{ scale: 1.015, y: -4 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7a5649] text-sm font-extrabold text-white">2</div>
            <div className="h-px flex-1 bg-[#c0c9bb4c]" />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-[#00450d]">Input Soil Data</h2>
          <p className="mt-2 text-sm leading-6 text-[#41493e]">
            Input complete NPK values, then enrich your profile with moisture, pH, light, temperature, and humidity. You can enter values manually or fetch them directly from your connected farm device.
          </p>

          <div className="mt-5 rounded-[20px] border border-[#c0c9bb33] bg-[#eff6e7] p-4">
            <p className="mb-3 text-[10px] font-semibold tracking-[1.2px] text-[#00450d]">CHEMICAL COMPOSITION (NPK)</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {npkPreviewFields.map((field) => (
                <div key={field.label} className="rounded-xl bg-[#e3ebdc] px-3 py-2 text-sm text-[#171d14]">
                  <div className="font-semibold">{field.label}</div>
                  <div>{field.value} {field.unit}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#c0c9bb33] pt-4">
              <p className="mb-3 text-[10px] font-semibold tracking-[1.2px] text-[#003e63]">ENVIRONMENTAL READINGS</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {environmentalPreviewFields.map((field) => (
                  <div key={field.label} className="rounded-xl bg-[#e3ebdc] px-3 py-2 text-sm text-[#171d14]">
                    <div className="font-semibold">{field.label}</div>
                    <div>{field.value} {field.unit}</div>
                  </div>
                ))}
              </div>
              <button className="mt-4 inline-flex items-center rounded-full bg-[#00450d] px-4 py-2 text-xs font-semibold text-white">Get Data from Device</button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-[28px] bg-white p-6 shadow-[0px_10px_24px_-12px_#00000030]"
          variants={sectionReveal}
          initial={false}
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          whileHover={{ scale: 1.015, y: -4 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003e63] text-sm font-extrabold text-white">3</div>
            <div className="h-px flex-1 bg-[#c0c9bb4c]" />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-[#00450d]">Receive Recommendations</h2>
          <p className="mt-2 text-sm leading-6 text-[#41493e]">
            Our proprietary Greenhouse AI processes your data against thousands of crop varieties to deliver a personalized roadmap for planting, irrigation, and fertilization.
          </p>

          <div className="mt-5 relative overflow-hidden rounded-[20px] bg-[url(/how-it-works/HIW.png)] bg-cover bg-[50%_50%] aspect-[16/10]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,69,13,0.1)_0%,rgba(0,69,13,0.5)_100%)]" />
            <div className="absolute inset-x-3 bottom-3 rounded-xl bg-[#ffffffd9] px-3 py-2 backdrop-blur-[8px]">
              <p className="text-xs font-semibold text-[#00450d]">AI Recommendation Ready</p>
              <p className="text-[11px] text-[#41493e]">Personalized plan generated from your live farm profile.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {recommendationCards.map((card) => (
              <div key={card.title} className="flex items-center gap-3 rounded-xl bg-[#dee5d6] px-3 py-2 text-sm text-[#171d14]">
                <card.Icon className="h-4 w-4 text-[#00450d]" />
                <div>
                  <div className="font-semibold">{card.title}</div>
                  <div className="text-xs text-[#41493e]">{card.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00450d] px-4 py-3 text-sm font-semibold text-white">
            Get Crop Recommendation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>

        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[24px] bg-[url(/how-it-works/HIW.png)] bg-cover bg-[50%_50%] shadow-[0px_18px_36px_-18px_#00000055]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,69,13,0.06)_0%,rgba(0,69,13,0.42)_100%)]" />
          <div className="absolute inset-x-3 bottom-3 rounded-[16px] bg-[#ffffffd9] p-3 backdrop-blur-[8px]">
            <p className="[font-family:'Inter-SemiBold',Helvetica] text-xs font-semibold text-[#00450d]">
              Full workflow preview
            </p>
            <p className="mt-0.5 [font-family:'Inter-Regular',Helvetica] text-[11px] leading-4 text-[#41493e]">
              Designed to mirror the complete desktop how-it-works narrative.
            </p>
          </div>
        </div>
      </motion.div>
    </div>

    <div ref={sectionRef} className="hidden lg:flex flex-col items-center gap-16 pt-16 pb-16 px-4 sm:px-8 lg:pt-32 lg:pb-24 lg:px-0 relative self-stretch w-full flex-[0_0_auto]">
      <div className="fixed top-20 left-0 z-40 hidden h-1 w-full bg-[#00450d1a] pointer-events-none lg:block">
        <motion.div className="h-full origin-left bg-[#00450d]" style={{ scaleX: progressScale }} />
      </div>
      <motion.div
        className="grid grid-cols-1 gap-8 w-full max-w-[1216px] h-fit lg:grid-cols-2 lg:gap-16"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.55 }}
      >
        <div className="relative w-full h-fit flex flex-col items-start gap-6 lg:w-[624px]">
          <div className="inline-flex items-start px-4 py-1.5 relative flex-[0_0_auto] bg-[#a3f69c] rounded-full">
            <div className="relative flex items-center w-[172.94px] h-5 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#005312] text-sm tracking-[0.35px] leading-5 whitespace-nowrap">
              THE PILLISEED METHOD
            </div>
          </div>
          <motion.div
            className="relative self-stretch w-full flex-[0_0_auto] flex flex-col items-start"
            variants={textPartContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.65 }}
          >
            <p className="relative w-full max-w-[598px] mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-4xl sm:text-5xl lg:text-7xl leading-tight lg:leading-[72px]">
              <motion.span className="text-[#00450d] tracking-[-1.30px] inline-block" variants={textPart}>
                From Soil to
                <br />
                Success in{" "}
              </motion.span>
              <motion.span className="text-[#7a5649] tracking-[0] inline-block" variants={textPart}>
                Three
                <br />
                Steps.
              </motion.span>
            </p>
          </motion.div>
          <div className="flex flex-col max-w-xl items-start pt-2 pb-0 px-0 relative w-full flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-base sm:text-lg lg:text-xl tracking-[0] leading-7 lg:leading-[32.5px]">
              {typedDesktopSubtitle}
              <motion.span
                className="inline-block ml-1 w-[2px] h-[1.35em] bg-[#065f18] align-[-0.25em]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
            </p>
          </div>
        </div>
        <div className="relative w-full h-fit flex flex-col items-start lg:w-full">
          <div className="absolute w-[calc(100%_+_32px)] h-[calc(100%_+_32px)] -top-4 -left-4 bg-[#00450d0d] rounded-[48px] blur-[32px]" />
          <div className="flex flex-col items-start justify-center relative self-stretch flex-[0_0_auto] rounded-[48px] overflow-hidden shadow-[0px_25px_50px_-12px_#00000040] aspect-[1.33] w-full bg-[#ffffff01]">
            <motion.div
              className="relative self-stretch w-full h-[432px] bg-[url(/how-it-works/HIW.png)] bg-cover bg-[50%_50%]"
              style={{ y: heroImageY }}
            />
          </div>
        </div>
      </motion.div>
      <div className="flex flex-col items-center gap-20 pt-0 pb-16 lg:pb-24 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <motion.div
          className="grid grid-cols-1 gap-8 w-full max-w-[1216px] h-fit lg:grid-cols-12 lg:gap-12"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          <div className="relative w-full h-fit flex flex-col items-start gap-6 lg:col-[1_/_6]">
            <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <motion.div
                className="flex w-12 h-12 items-center justify-center pt-[7.5px] pb-[8.5px] px-0 relative bg-[#00450d] rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.45 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative flex items-center justify-center w-[10.91px] h-8 mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-white text-2xl text-center tracking-[0] leading-8 whitespace-nowrap">
                  1
                </div>
              </motion.div>
              <div className="relative flex-1 grow h-px bg-[#c0c9bb4c]" />
            </div>
            <div className="relative self-stretch w-full flex-[0_0_auto] flex flex-col items-start">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-3xl sm:text-4xl text-[#00450d] tracking-[0] leading-tight sm:leading-10">
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
                  <MapPinned className="relative h-5 w-4 text-[#00450d]" aria-hidden="true" />
                </div>
                <p className="w-full h-6 mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#171d14] text-sm sm:text-base tracking-[0] leading-6 relative flex items-center whitespace-nowrap">
                  Precision geolocation up to 1 meter accuracy.
                </p>
              </div>
              <div className="flex items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex flex-col items-start pt-1 pb-0 px-0 relative flex-[0_0_auto]">
                  <Mountain className="relative h-[19.05px] w-[18px] text-[#00450d]" aria-hidden="true" />
                </div>
                <div className="w-full h-6 mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#171d14] text-sm sm:text-base tracking-[0] leading-6 relative flex items-center whitespace-nowrap">
                  Automatic regional topography analysis.
                </div>
              </div>
            </div>
          </div>
          <motion.div
            className="relative w-full h-fit flex flex-col items-start p-4 bg-[#e3ebdc] rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-[0px_1px_2px_#0000000d] lg:col-[6_/_13]"
            whileHover={{ scale: 1.015, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </motion.div>
        </motion.div>
        <motion.div
          className="flex flex-col items-center px-8 py-32 relative self-stretch w-full flex-[0_0_auto] bg-[#eff6e7]"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          <div className="grid grid-cols-1 gap-8 w-full max-w-[1216px] h-fit lg:grid-cols-12 lg:gap-12">
            <motion.div
              className="relative w-full h-fit flex flex-col items-start gap-8 p-6 sm:p-8 bg-white rounded-[32px] lg:rounded-[48px] border border-solid border-[#c0c9bb1a] lg:col-[1_/_8]"
              whileHover={{ scale: 1.01, y: -5 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute h-full top-0 left-0 rounded-[48px] shadow-[0px_8px_10px_-6px_#0000001a,0px_20px_25px_-5px_#0000001a] w-full bg-[#ffffff01]" />
              <div className="w-full space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 items-center rounded-full bg-[#00450d1a] px-3 [font-family:'Inter-SemiBold',Helvetica] text-[10px] font-semibold tracking-[1.2px] text-[#00450d]">
                      CHEMICAL COMPOSITION (NPK)
                    </span>
                  </div>
                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                    {npkPreviewFields.map((field, index) => {
                      return (
                        <motion.div
                          key={field.label}
                          className="flex flex-col gap-2"
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.45 }}
                          transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                            {field.label}
                          </div>
                          <div className="flex min-h-12 items-center justify-between px-4 py-3 bg-[#e3ebdc] rounded-md overflow-hidden">
                            <div className="[font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-base tracking-[0] leading-6">
                              {field.value}
                            </div>
                            <div className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#717a6d] text-xs tracking-[0] leading-4">
                              {field.unit}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#c0c9bb33] pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="inline-flex h-8 items-center rounded-full bg-[#003e631a] px-3 [font-family:'Inter-SemiBold',Helvetica] text-[10px] font-semibold tracking-[1.2px] text-[#003e63]">
                      ENVIRONMENTAL READINGS
                    </span>
                    <button className="all-[unset] box-border inline-flex items-center rounded-full bg-[#00450d] px-4 py-2 [font-family:'Inter-SemiBold',Helvetica] text-xs font-semibold text-white tracking-[0] leading-4 cursor-default">
                      Get Data from Device
                    </button>
                  </div>
                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    {environmentalPreviewFields.map((field, index) => {
                      return (
                        <motion.div
                          key={field.label}
                          className="flex flex-col gap-2"
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.45 }}
                          transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                            {field.label}
                          </div>
                          <div className="flex min-h-12 items-center justify-between px-4 py-3 bg-[#e3ebdc] rounded-md overflow-hidden">
                            <div className="[font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-base tracking-[0] leading-6">
                              {field.value}
                            </div>
                            <div className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#717a6d] text-xs tracking-[0] leading-4">
                              {field.unit}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="[font-family:'Inter-Regular',Helvetica] text-[#41493e] text-xs tracking-[0] leading-5">
                    Auto-sync pulls moisture, pH, light, temperature, and humidity from your linked farm device.
                  </p>
                </div>
              </div>

              <button className="all-[unset] box-border flex gap-2 px-0 py-4 self-stretch w-full bg-[#00450d] rounded-full items-center justify-center relative flex-[0_0_auto]">
                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-full shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a]" />
                  <div className="justify-center w-auto max-w-full h-6 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-white text-sm sm:text-base text-center tracking-[0] leading-6 relative flex items-center whitespace-nowrap">
                  Get Crop Recommendation
                </div>
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <ArrowRight className="relative h-[18px] w-[18px] text-white" aria-hidden="true" />
                </div>
              </button>
            </motion.div>
              <div className="relative w-full h-fit flex flex-col items-start gap-6 lg:col-[8_/_13]">
              <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <motion.div
                  className="flex w-12 h-12 items-center justify-center pt-[7.5px] pb-[8.5px] px-0 relative bg-[#7a5649] rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: false, amount: 0.45 }}
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
                  Input complete NPK values, then enrich your profile with
                  <br />
                  moisture, pH, light, temperature, and humidity. You can
                  <br />
                  enter values manually or fetch them directly from your
                  <br />
                  connected farm device.
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
          viewport={{ once: false, amount: 0.5 }}
        >
          <div className="relative row-[1_/_2] col-[1_/_6] self-center w-full h-fit flex flex-col items-start gap-6">
            <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <motion.div
                className="flex w-12 h-12 items-center justify-center pt-[7.5px] pb-[8.5px] px-0 relative bg-[#003e63] rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.45 }}
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
                  viewport={{ once: false, amount: 0.45 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <div
                    className={`${card.iconBg} flex w-12 h-12 items-center justify-center relative rounded-full shadow-[0px_1px_2px_#0000000d]`}
                  >
                    <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                      <card.Icon className={`${card.iconClass} text-white`} aria-hidden="true" />
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 h-fit relative w-full lg:col-[6_/_13]">
            {forecastCards.map((card, index) => (
              <motion.div
                key={card.title}
                className={`${card.colClass} relative min-h-[238px] h-auto bg-white rounded-[32px] lg:rounded-[48px] border border-solid border-[#00450d0d]`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.45 }}
                transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, y: -6 }}
              >
                <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-[48px] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                <div
                  className={`flex w-[calc(100%_-_50px)] h-32 items-center justify-center absolute top-[25px] left-[25px] ${card.iconBg} rounded-[32px]`}
                >
                  <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <card.Icon className={`${card.iconClass} text-[#00450d]`} aria-hidden="true" />
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};
