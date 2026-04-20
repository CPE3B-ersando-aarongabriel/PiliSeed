"use client";
import { JSX } from "react";

const steps = [
  {
    number: "1",
    icon: "/landing/Hiw_1.svg",
    title: "Enter Location",
    description:
      "Define your plot boundaries using our high-resolution satellite mapping tool.",
  },
  {
    number: "2",
    icon: "/landing/Hiw_2.svg",
    title: "Log Soil Data",
    description:
      "Input your latest laboratory results or sync with your existing field sensors.",
  },
  {
    number: "3",
    icon: "/landing/Hiw_3.svg",
    title: "Get Recommendations",
    description:
      "Receive an actionable harvest roadmap within seconds of data processing.",
  },
];

export const Howitworks_summary = (): JSX.Element => {
  return (
    <section className="w-full bg-[#00450d] px-4 py-14 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-center gap-5 text-center sm:mb-14 lg:mb-20 lg:flex-row lg:items-start lg:justify-between lg:text-left">
          <div className="max-w-2xl flex-1">
            <h2 className="[font-family:'Inter-ExtraBold',Helvetica] text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              Simple Setup,
              <br />
              Infinite Growth.
            </h2>
          </div>

          <div className="max-w-md flex-1">
            <p className="[font-family:'Inter-Regular',Helvetica] text-[#a3f69cb2] text-base sm:text-lg font-normal leading-7">
              Start your digital transformation in minutes. No complex hardware
              required, just your data and our engine.
            </p>
          </div>
        </div>

        <div className="relative pt-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent" />

          <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <article
                key={step.number}
                className="flex flex-col items-center text-center pt-6 sm:pt-8"
              >
                <div className="relative mb-7">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#ffffff33] bg-[#ffffff1a] backdrop-blur-md">
                    <img className="h-6 w-6" alt={step.title} src={step.icon} />
                  </div>
                  <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#a3f69c]">
                    <span className="text-[#002204] text-sm font-semibold">
                      {step.number}
                    </span>
                  </div>
                </div>

                <h3 className="[font-family:'Manrope-Bold',Helvetica] text-white text-xl sm:text-2xl font-bold leading-tight mb-3">
                  {step.title}
                </h3>

                <p className="[font-family:'Inter-Regular',Helvetica] text-[#a3f69c99] text-sm sm:text-base font-normal leading-6 max-w-xs">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
