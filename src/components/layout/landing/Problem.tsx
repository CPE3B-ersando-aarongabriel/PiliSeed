
export const GlobalFoodCrisisSection = (): JSX.Element => {
  const stats = [
    {
      value: "30%",
      label: "WASTE REDUCTION",
      color: "#00450d",
      borderColor: "border-[#00450d]",
      col: "col-[1_/_2]",
    },
    {
      value: "2.4x",
      label: "EFFICIENCY GAIN",
      color: "#003e63",
      borderColor: "border-[#003e63]",
      col: "col-[2_/_3]",
    },
  ];

  return (
    <div className="flex flex-col w-[1280px] items-start px-8 py-24 absolute top-[1315px] left-1/2 -translate-x-1/2 bg-white">
      <div className="grid grid-cols-2 grid-rows-[518.50px] max-w-screen-xl h-fit gap-16">
        <div className="relative row-[1_/_2] col-[1_/_2] self-center w-full h-fit flex flex-col items-start gap-6">
          <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-12 h-0.5 bg-[#00450d]" />
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="relative flex items-center w-[126px] h-5 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-sm tracking-[1.40px] leading-5 whitespace-nowrap">
                GLOBAL IMPACT
              </div>
            </div>
          </div>

          <div className="relative self-stretch w-full h-[253px]">
            <p className="absolute w-full top-[30px] left-0 h-[193px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-transparent text-6xl leading-[60px]">
              <span className="text-[#171d14] tracking-[-1.80px]">
                Addressing the
                <br />
              </span>
              <span className="text-[#7a5649] tracking-[0] underline">
                Global Crisis
              </span>
              <span className="text-[#171d14] tracking-[-1.80px]">
                {" "}
                of Food Security.
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-xl tracking-[0] leading-[32.5px]">
              By 2050, the world will need to produce 70% more food.
              <br />
              Traditional farming methods are struggling against climate
              <br />
              change. PiliSeed aligns with UN Sustainable Development
              <br />
              Goals (SDG 2: Zero Hunger &amp; SDG 12: Responsible
              <br />
              Consumption) to revolutionize how we nourish the planet.
            </p>
          </div>

          <div className="grid grid-cols-2 grid-rows-[60px] h-fit gap-8 pt-4 pb-0 px-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`relative row-[1_/_2] ${stat.col} w-full h-fit flex flex-col items-start gap-[3.5px] pl-6 pr-0 py-0 border-l-4 [border-left-style:solid] ${stat.borderColor}`}
              >
                <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                  <div
                    className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-3xl tracking-[0] leading-9"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                </div>
                <div className="relative flex items-center h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5 whitespace-nowrap">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative row-[1_/_2] col-[2_/_3] self-center w-full h-fit flex flex-col items-start">
          <div className="absolute w-full h-full -top-12 left-12 bg-[#00450d0d] rounded-full aspect-[1]" />

          <div className="relative self-stretch w-full h-[500px] rounded-[32px] shadow-[0px_25px_50px_-12px_#00000040] bg-[url(/landing/Problem.png)] bg-cover bg-[50%_50%]" />

          <div className="inline-flex items-center gap-4 p-6 absolute -left-8 -bottom-8 bg-white rounded-[48px]">
            <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-[48px] shadow-[0px_8px_10px_-6px_#0000001a,0px_20px_25px_-5px_#0000001a]" />

            <div className="flex w-12 h-12 items-center justify-center relative bg-[#ffdbcf] rounded-full">
              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <img
                  className="relative w-[17px] h-[16.99px]"
                  alt="Icon"
                  src="/landing/leaf.svg"
                />
              </div>
            </div>

            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center w-[95.58px] h-6 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#171d14] text-base tracking-[0] leading-6 whitespace-nowrap">
                  SDG Aligned
                </div>
              </div>

              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center w-[153.19px] h-4 mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-xs tracking-[0] leading-4 whitespace-nowrap">
                  Sustainable Agriculture 2.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { JSX } from "react";

export const Problem = (): JSX.Element => {
  const stats = [
    {
      value: "30%",
      label: "WASTE REDUCTION",
      color: "#00450d",
      borderColor: "border-[#00450d]",
      col: "col-[1_/_2]",
    },
    {
      value: "2.4x",
      label: "EFFICIENCY GAIN",
      color: "#003e63",
      borderColor: "border-[#003e63]",
      col: "col-[2_/_3]",
    },
  ];

  return (
    <div className="flex flex-col w-full items-start px-4 sm:px-8 py-12 sm:py-24 relative sm:absolute sm:top-[1315px] sm:left-1/2 sm:-translate-x-1/2 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-auto lg:grid-rows-[518.50px] h-fit gap-8 lg:gap-16 w-full">
        <div className="relative row-[1_/_2] col-[1_/_2] self-center w-full h-fit flex flex-col items-start gap-6">
          <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-12 h-0.5 bg-[#00450d]" />
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="relative flex items-center w-[126px] h-5 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-sm tracking-[1.40px] leading-5 whitespace-nowrap">
                GLOBAL IMPACT
              </div>
            </div>
          </div>

          <div className="relative self-stretch w-full h-[253px]">
            <p className="absolute w-full top-[30px] left-0 h-[193px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-transparent text-6xl leading-[60px]">
              <span className="text-[#171d14] tracking-[-1.80px]">
                Addressing the
                <br />
              </span>
              <span className="text-[#7a5649] tracking-[0] underline">
                Global Crisis
              </span>
              <span className="text-[#171d14] tracking-[-1.80px]">
                {" "}
                of Food Security.
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-xl tracking-[0] leading-[32.5px]">
              By 2050, the world will need to produce 70% more food.
              <br />
              Traditional farming methods are struggling against climate
              <br />
              change. PiliSeed aligns with UN Sustainable Development
              <br />
              Goals (SDG 2: Zero Hunger &amp; SDG 12: Responsible
              <br />
              Consumption) to revolutionize how we nourish the planet.
            </p>
          </div>

          <div className="grid grid-cols-2 grid-rows-[60px] h-fit gap-8 pt-4 pb-0 px-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`relative row-[1_/_2] ${stat.col} w-full h-fit flex flex-col items-start gap-[3.5px] pl-6 pr-0 py-0 border-l-4 [border-left-style:solid] ${stat.borderColor}`}
              >
                <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                  <div
                    className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-3xl tracking-[0] leading-9"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                </div>
                <div className="relative flex items-center h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5 whitespace-nowrap">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative row-[1_/_2] col-[2_/_3] self-center w-full h-fit flex flex-col items-end">
          <div className="absolute w-full h-full -top-12 right-12 bg-[#00450d0d] rounded-full aspect-[1]" />

          <div className="relative self-stretch w-full h-[500px] rounded-[32px] shadow-[0px_25px_50px_-12px_#00000040] bg-[url(/landing/Problem.png)] bg-cover bg-[50%_50%]" />

          <div className="inline-flex items-center gap-4 p-6 absolute -left-8 -bottom-8 bg-white rounded-[48px]">
            <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-[48px] shadow-[0px_8px_10px_-6px_#0000001a,0px_20px_25px_-5px_#0000001a]" />

            <div className="flex w-12 h-12 items-center justify-center relative bg-[#ffdbcf] rounded-full">
              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <img
                  className="relative w-[17px] h-[16.99px]"
                  alt="Icon"
                  src="/landing/leaf.svg"
                />
              </div>
            </div>

            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center w-[95.58px] h-6 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#171d14] text-base tracking-[0] leading-6 whitespace-nowrap">
                  SDG Aligned
                </div>
              </div>

              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center w-[153.19px] h-4 mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-xs tracking-[0] leading-4 whitespace-nowrap">
                  Sustainable Agriculture 2.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
