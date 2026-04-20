"use client";

import { motion, type Variants } from "framer-motion";
import { JSX } from "react";
import { BadgeCheck, Sprout } from "lucide-react";

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const missionPoints = [
  {
    Icon: BadgeCheck,
    alt: "Icon",
    text: "Reducing water waste by 30% through precision sensing.",
  },
  {
    Icon: BadgeCheck,
    alt: "Icon",
    text: "Predicting soil nutrient depletion before it happens.",
  },
  {
    Icon: BadgeCheck,
    alt: "Icon",
    text: "Creating climate-resilient farming communities.",
  },
];

const teamMembers = [
  {
    name: "Francine Nicole Navarro",
    bgImage: "/about/About_Francine.png",
    leftOffset: 0,
    gap: "gap-[15.5px]",
    nameWidth: "w-[206px]",
    nameInnerWidth: "w-[206px]",
    nameMargin: "",
  },
  {
    name: "Aaron Gabriel Ersando",
    bgImage: "/about/About_Aaron.png",
    leftOffset: 248,
    gap: "gap-4",
    nameWidth: "w-[193px]",
    nameInnerWidth: "w-[193px]",
    nameMargin: "-ml-px",
  },
  {
    name: "Josh Lendl Cagara",
    bgImage: "/about/About_Josh.png",
    leftOffset: 496,
    gap: "gap-4",
    nameWidth: "w-56",
    nameInnerWidth: "w-[166px]",
    nameMargin: "mt-[-0.5px]",
  },
  {
    name: "Kie Sha Villanueva",
    bgImage: "/about/About_KieSha.png",
    leftOffset: 744,
    gap: "gap-4",
    nameWidth: "w-[158px]",
    nameInnerWidth: "w-[158px]",
    nameMargin: "",
  },
  {
    name: "Adrian Jude Fabros",
    bgImage: "/about/About_Adrian.png",
    leftOffset: 992,
    gap: "gap-[15.5px]",
    nameWidth: "w-56",
    nameInnerWidth: "w-[165px]",
    nameMargin: "-ml-px",
  },
];

export const About_Body = (): JSX.Element => {
  return (
    <>
    <div className="flex lg:hidden flex-col items-center gap-16 pt-24 pb-16 px-4 sm:px-8 w-full">
      <motion.div
        className="mx-auto w-full max-w-3xl space-y-5"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
        <p className="[font-family:'Inter-SemiBold',Helvetica] text-xs font-semibold tracking-[1.4px] text-[#7a5649]">CULTIVATING TOMORROW</p>
        <h1 className="[font-family:'Inter-ExtraBold',Helvetica] text-4xl font-extrabold leading-tight text-[#00450d] sm:text-5xl">
          Roots in data.
          <br />
          Growth in tech.
        </h1>
        <p className="[font-family:'Inter-Regular',Helvetica] text-base leading-7 text-[#41493e]">
          At PiliSeed, we bridge ancestral farming wisdom with digital precision to help growers make better decisions every season.
        </p>
      </motion.div>

      <motion.div
        className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        <div className="rounded-[28px] bg-[#eff6e7] p-6">
          <h2 className="[font-family:'Inter-ExtraBold',Helvetica] text-2xl font-extrabold text-[#00450d]">Our Mission</h2>
          <p className="mt-3 [font-family:'Inter-Regular',Helvetica] text-sm leading-6 text-[#41493e]">
            Democratize agricultural technology so every farm can optimize resources and increase sustainable growth.
          </p>
          <div className="mt-4 space-y-2">
            {missionPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-[#00450d]">
                <point.Icon className="mt-0.5 h-4 w-4" aria-label={point.alt} />
                <span>{point.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-[#e3ebdc] p-6">
          <h2 className="[font-family:'Inter-ExtraBold',Helvetica] text-2xl font-extrabold text-[#00450d]">Our Vision</h2>
          <p className="mt-3 [font-family:'Inter-Regular',Helvetica] text-sm leading-6 text-[#41493e]">
            A future where intelligent, sustainable farming becomes the default and strengthens food systems globally.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="mx-auto w-full max-w-6xl"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h3 className="mb-6 text-center [font-family:'Manrope-ExtraBold',Helvetica] text-3xl font-extrabold text-[#00450d]">The Minds Behind the Seed</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {teamMembers.map((member) => (
            <div key={member.name} className="rounded-[24px] bg-white p-3 shadow-[0px_10px_24px_-12px_#00000040]">
              <div className="h-40 w-full rounded-[20px] bg-cover bg-center" style={{ backgroundImage: `url(${member.bgImage})` }} />
              <p className="mt-3 text-center [font-family:'Manrope-Bold',Helvetica] text-sm font-bold text-[#00450d]">{member.name}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    <div className="hidden lg:flex flex-col items-center gap-24 pt-32 pb-20 px-0 relative self-stretch w-full flex-[0_0_auto]">
      <motion.div
        className="flex w-[1216px] items-end gap-12 relative flex-[0_0_auto]"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
        <div className="flex flex-col w-[778.67px] items-start gap-4 relative">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#7a5649] text-sm tracking-[1.40px] leading-5">
              CULTIVATING TOMORROW
            </div>
          </div>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-8xl tracking-[-4.80px] leading-[96px]">
              Roots in data.
              <br />
              Growth in tech.
            </p>
          </div>
          <div className="flex flex-col max-w-xl w-[576px] items-start pt-4 pb-0 px-0 relative flex-[0_0_auto]">
            <p className="relative w-[564.22px] h-[98px] mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-xl tracking-[0] leading-[32.5px]">
              At PiliSeed, we believe the future of farming is written in the
              <br />
              soil and interpreted by intelligence. We are bridging the gap
              <br />
              between ancestral wisdom and digital precision.
            </p>
          </div>
        </div>
        <div className="flex flex-col w-[389.33px] items-start relative">
          <div className="justify-end pt-[256.33px] pb-8 px-8 self-stretch w-full flex-[0_0_auto] bg-[#dee5d6] flex flex-col items-start relative rounded-[48px] overflow-hidden">
            <img
              className="absolute w-full h-full top-0 left-0 mix-blend-multiply"
              alt="Image"
              src="/about/About.png"
            />
            <div className="flex flex-col items-start gap-[15.25px] relative self-stretch w-full flex-[0_0_auto]">
              <Sprout className="relative h-[25.49px] w-[25.49px] text-[#00450d]" aria-hidden="true" />
              <div className="flex flex-col items-start pt-0 pb-[0.75px] px-0 relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#00450d] text-lg tracking-[0] leading-[22.5px]">
                  Empowering 10,000+ farmers with
                  <br />
                  real-time insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="flex flex-col items-center px-0 py-24 self-stretch flex-[0_0_auto] bg-[#eff6e7] relative w-full"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid w-[1216px] grid-cols-2 grid-rows-[710px] items-stretch gap-20">
          <div className="relative row-[1_/_2] col-[1_/_2] self-stretch w-full h-full flex flex-col items-start bg-[#ffffff01] rounded-[48px] overflow-hidden shadow-[0px_25px_50px_-12px_#00000040]">
            <div className="relative self-stretch w-full aspect-[0.8] bg-[url(/about/About_2.png)] bg-cover bg-[50%_50%]" />
            <div className="flex flex-col w-[calc(100%_-_64px)] items-start p-6 absolute left-8 bottom-8 bg-[#ffffffcc] rounded-[32px] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]">
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#7a5649] text-base tracking-[0] leading-6">
                  &#34;We don&#39;t just measure yield; we measure the health of
                  <br />
                  the entire ecosystem.&#34;
                </p>
              </div>
            </div>
          </div>
          <div className="relative row-[1_/_2] col-[2_/_3] self-stretch w-full h-full flex flex-col items-start gap-12">
            <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-4xl tracking-[0] leading-10">
                  Our Mission
                </div>
              </div>
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-lg tracking-[0] leading-[29.2px]">
                  To democratize agricultural technology. We provide every farmer
                  from small-scale family plots to large agricultural
                  enterprises with the tools they need to optimize resources and
                  maximize growth.
                </p>
              </div>
              <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                {missionPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 relative self-stretch w-full flex-[0_0_auto]"
                  >
                    <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                      <point.Icon className="relative h-5 w-5 text-[#00450d]" aria-label={point.alt} />
                    </div>
                    <p className="mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#00450d] text-base tracking-[0] leading-6 relative flex items-center">
                      {point.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative self-stretch w-full h-px bg-[#c0c9bb4c]" />
            <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start flex-[0_0_auto] relative self-stretch w-full">
                <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-4xl tracking-[0] leading-10">
                  Our Vision
                </div>
              </div>
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-lg tracking-[0] leading-[29.2px]">
                  A world where sustainable farming isn&#39;t just a goal, but a
                  standard enabled by intelligent hardware and empathetic
                  software. We envision a global network of &#34;Digital
                  Greenhouses&#34; that feed the planet without exhausting it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="max-w-screen-xl h-[525.66px] relative w-full"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col w-[calc(100%_-_64px)] items-center gap-4 absolute top-0 left-8">
          <div className="h-10 relative self-stretch w-full" />
          <div className="flex flex-col max-w-2xl w-[672px] items-center relative flex-[0_0_auto]">
            <p className="justify-center w-[476.5px] h-10 mt-[-1.00px] [font-family:'Manrope-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-4xl text-center tracking-[0] leading-10 relative flex items-center whitespace-nowrap">
              The Minds Behind the Seed
            </p>
          </div>
        </div>
        <div className="absolute w-[calc(100%_-_64px)] top-[168px] left-8 h-[358px]">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className={`absolute w-[calc(100%_-_992px)] top-0 h-[358px] flex flex-col ${member.gap}`}
              style={{ left: `${member.leftOffset}px` }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {member.bgImage ? (
                <div className="flex-1 max-h-[298.66px] w-56 justify-center bg-[#41493e] aspect-[0.75] flex flex-col items-start relative rounded-[48px] overflow-hidden">
                  <div
                    className="bg-cover bg-[50%_50%] relative self-stretch w-full h-[298.66px]"
                    style={{ backgroundImage: `url(${member.bgImage})` }}
                  />
                </div>
              ) : (
                <div className="flex flex-1 max-h-[298.66px] relative flex-col w-56 items-start justify-center bg-[#dee5d6] rounded-[48px] overflow-hidden aspect-[0.75]">
                  <div className="relative self-stretch w-full h-[298.66px] bg-[#41493e]" />
                </div>
              )}
              <div
                className={`${index === 0 ? "w-[206px] self-center flex" : index === 4 ? "w-56 justify-center self-center flex" : index === 2 ? "w-56 justify-center self-center flex" : "flex-1 max-h-7 flex justify-center"}`}
              >
                <div
                  className={`${member.nameMargin} ${member.nameInnerWidth} flex items-center h-7 [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-lg tracking-[0] leading-7 whitespace-nowrap`}
                >
                  {member.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
    </>
  );
};
