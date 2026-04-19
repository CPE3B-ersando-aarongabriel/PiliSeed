import { JSX } from "react";

const highlights = [
  {
    iconSrc: "/landing/features_1.svg",
    iconAlt: "Icon",
    iconWrapperBg: "bg-[#00450d1a]",
    iconWidth: "w-[22.57px]",
    iconHeight: "h-[22.5px]",
    title: "Precision Soil Analysis",
    titleWidth: "w-[260.36px]",
    titleHeight: "h-8",
    descriptionTop: "top-[161px]",
    descriptionWidth: "w-[294.47px]",
    descriptionHeight: "h-[104px]",
    description: (
      <>
        Deep-dive into your soil&#39;s chemical
        <br />
        composition. We analyze pH, NPK, and
        <br />
        micronutrients to build a custom
        <br />
        nourishment profile.
      </>
    ),
  },
  {
    iconSrc: "/landing/features_2.svg",
    iconAlt: "Icon",
    iconWrapperBg: "bg-[#003e631a]",
    iconWidth: "w-[25px]",
    iconHeight: "h-[26.25px]",
    title: "Real-time Weather Alerts",
    titleWidth: "w-[292.91px]",
    titleHeight: "h-8",
    descriptionTop: "top-[161px]",
    descriptionWidth: "w-[314.61px]",
    descriptionHeight: "h-[104px]",
    description: (
      <>
        Hyper-local forecasting that warns you of
        <br />
        micro-climatic shifts before they impact
        <br />
        your crops. Never be surprised by frost
        <br />
        again.
      </>
    ),
  },
  {
    iconSrc: "/landing/features_3.svg",
    iconAlt: "Icon",
    iconWrapperBg: "bg-[#7a56491a]",
    iconWidth: "w-[23.76px]",
    iconHeight: "h-[25px]",
    title: (
      <>
        AI-Driven
        <br />
        Recommendations
      </>
    ),
    titleWidth: "w-[219.03px]",
    titleHeight: "h-16",
    descriptionTop: "top-[193px]",
    descriptionWidth: "w-[317.55px]",
    descriptionHeight: "h-[78px]",
    description: (
      <>
        Our neural network suggests optimal crop
        <br />
        rotation and planting schedules based on
        <br />
        historical data and current soil state.
      </>
    ),
  },
];

export const Features_summary = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full items-start gap-8 sm:gap-16 px-4 sm:px-8 py-12 sm:py-24 relative sm:absolute sm:top-[2730px] sm:left-1/2 sm:-translate-x-1/2">
      <div className="flex flex-col items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-center self-stretch w-full flex-[0_0_auto] relative flex-col">
          <div className="relative flex items-center justify-center w-full h-auto mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#171d14] text-2xl sm:text-4xl text-center tracking-[-1.80px] leading-8 sm:leading-10">
            Precision Agriculture Core
          </div>
        </div>

        <div className="flex flex-col max-w-2xl w-full items-center relative flex-[0_0_auto] px-4 sm:px-0">
          <p className="relative flex items-center justify-center w-full h-auto mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-sm sm:text-base text-center tracking-[0] leading-5 sm:leading-6">
            Unlock the full potential of your land with our suite of intelligent agricultural tools.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-auto lg:grid-rows-[304px] w-full h-fit gap-4 sm:gap-8">
        {highlights.map((item, index) => (
          <div
            key={index}
            className="relative row-[1_/_2] w-full h-[304px] bg-[#eff6e7] rounded-[48px] border border-solid border-[#c0c9bb4c]"
          >
            <div
              className={`flex w-14 h-14 items-center justify-center absolute top-[33px] left-[33px] ${item.iconWrapperBg} rounded-[48px]`}
            >
              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <img
                  className={`relative ${item.iconWidth} ${item.iconHeight}`}
                  alt={item.iconAlt}
                  src={item.iconSrc}
                />
              </div>
            </div>

            <div className="flex flex-col w-[calc(100%_-_66px)] items-start absolute top-[113px] left-[33px]">
              <div
                className="relative flex items-center w-auto h-auto mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#171d14] text-xl lg:text-2xl tracking-[0] leading-8"
              >
                {item.title}
              </div>
            </div>

            <div
              className="flex flex-col w-[calc(100%_-_66px)] items-start absolute top-[170px] lg:top-[193px] left-[33px]"
            >
              <p
                className="relative w-full h-auto mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-sm lg:text-base tracking-[0] leading-[26px]"
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
