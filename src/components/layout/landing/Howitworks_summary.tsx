"use client";
import { JSX } from "react";

const steps = [
  {
    number: "1",
    icon: "/landing/Hiw_1.svg",
    title: "Enter Location",
    descLine1: "Define your plot boundaries using our high-",
    descLine2: "resolution satellite mapping tool.",
  },
  {
    number: "2",
    icon: "/landing/Hiw_2.svg",
    title: "Log Soil Data",
    descLine1: "Input your latest laboratory results or sync with",
    descLine2: "your existing field sensors.",
  },
  {
    number: "3",
    icon: "/landing/Hiw_3.svg",
    title: "Get Recommendations",
    descLine1: "Receive an actionable harvest roadmap within",
    descLine2: "seconds of data processing.",
  },
];

export const Howitworks_summary = (): JSX.Element => {
  return (
    <section className="absolute top-[3370px] left-0 w-full bg-[#00450d] px-8 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-20 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h2 className="font-extrabold text-white text-4xl md:text-5xl leading-tight">
              Simple Setup,
              <br />
              Infinite Growth.
            </h2>
          </div>

          <div className="flex-1 md:max-w-md">
            <p className="text-[#a3f69cb2] text-lg leading-7">
              Start your digital transformation in minutes. No complex hardware
              required, just your data and our engine.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="relative pt-8">
          {/* Top divider line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center pt-12"
              >
                {/* Icon Circle with Badge */}
                <div className="relative mb-8">
                  <div className="flex w-20 h-20 items-center justify-center rounded-full bg-[#ffffff1a] border border-[#ffffff33] backdrop-blur-md">
                    <img
                      className="w-6 h-6"
                      alt={step.title}
                      src={step.icon}
                    />
                  </div>
                  {/* Number Badge */}
                  <div className="flex w-8 h-8 items-center justify-center absolute -top-2 -left-2 bg-[#a3f69c] rounded-full">
                    <span className="font-semibold text-[#002204] text-sm">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-white text-xl md:text-2xl mb-4">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[#a3f69c99] text-base leading-6">
                  {step.descLine1}
                  <br />
                  {step.descLine2}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
