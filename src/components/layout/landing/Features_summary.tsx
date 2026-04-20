import { JSX } from "react";

const highlights = [
  {
    iconSrc: "/landing/features_1.svg",
    iconAlt: "Precision soil analysis icon",
    iconWrapperBg: "bg-[#00450d1a]",
    iconClassName: "w-[22.57px] h-[22.5px]",
    title: "Precision Soil Analysis",
    description:
      "Deep-dive into your soil's chemical composition. We analyze pH, NPK, and micronutrients to build a custom nourishment profile.",
  },
  {
    iconSrc: "/landing/features_2.svg",
    iconAlt: "Weather alerts icon",
    iconWrapperBg: "bg-[#003e631a]",
    iconClassName: "w-[25px] h-[26.25px]",
    title: "Real-time Weather Alerts",
    description:
      "Hyper-local forecasting that warns you of micro-climatic shifts before they impact your crops. Never be surprised by frost again.",
  },
  {
    iconSrc: "/landing/features_3.svg",
    iconAlt: "AI recommendations icon",
    iconWrapperBg: "bg-[#7a56491a]",
    iconClassName: "w-[23.76px] h-[25px]",
    title: "AI-Driven Recommendations",
    description:
      "Our neural network suggests optimal crop rotation and planting schedules based on historical data and current soil state.",
  },
];

export const Features_summary = (): JSX.Element => {
  return (
    <section className="w-full bg-[#f5fced]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-14 sm:gap-12 sm:px-8 sm:py-20 lg:gap-16 lg:py-24">
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="[font-family:'Inter-ExtraBold',Helvetica] text-[#171d14] text-3xl sm:text-4xl font-extrabold tracking-[-1.2px] sm:tracking-[-1.8px] leading-tight">
            Precision Agriculture Core
          </h2>

          <p className="[font-family:'Inter-Regular',Helvetica] text-[#41493e] text-sm sm:text-base font-normal tracking-[0] leading-6">
            Unlock the full potential of your land with our suite of intelligent agricultural tools.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="flex min-h-[320px] w-full flex-col rounded-[32px] sm:rounded-[40px] border border-solid border-[#c0c9bb4c] bg-[#eff6e7] px-6 py-7 sm:px-8 sm:py-8"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${item.iconWrapperBg}`}
              >
                <img className={item.iconClassName} alt={item.iconAlt} src={item.iconSrc} />
              </div>

              <h3 className="mt-5 [font-family:'Manrope-Bold',Helvetica] text-[#171d14] text-xl sm:text-2xl font-bold leading-8 tracking-[0]">
                {item.title}
              </h3>

              <p className="mt-4 [font-family:'Inter-Regular',Helvetica] text-[#41493e] text-sm sm:text-base font-normal leading-7 tracking-[0]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
