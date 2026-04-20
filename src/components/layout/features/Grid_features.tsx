"use client";

import { motion, type Variants } from "framer-motion";
import { JSX } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CloudSunRain,
  Droplets,
  FlaskConical,
  MapPinned,
} from "lucide-react";

const gridContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const soilAnalysisParameters = [
  { label: "Nitrogen (N)", value: "18 mg/kg", quality: "84% Optimal", width: "w-[84%]" },
  { label: "Phosphorus (P)", value: "9 mg/kg", quality: "Needs Boost", width: "w-[56%]" },
  { label: "Potassium (K)", value: "24 mg/kg", quality: "Healthy", width: "w-[78%]" },
  { label: "Soil pH", value: "6.5", quality: "Balanced", width: "w-[72%]" },
];

export const Grid_features = (): JSX.Element => {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:hidden">
        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-[28px] bg-white p-6 shadow-[0px_10px_30px_-12px_#00000030]">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#00450d1a]">
              <MapPinned className="h-5 w-5 text-[#00450d]" aria-hidden="true" />
            </div>
            <h3 className="[font-family:'Inter-ExtraBold',Helvetica] text-2xl font-extrabold text-[#00450d]">Smart Farm Location Mapping</h3>
            <p className="mt-3 [font-family:'Inter-Regular',Helvetica] text-sm leading-6 text-[#41493e]">
              Register farms, set one as active, and keep location context locked so soil analysis and recommendations stay farm-specific.
            </p>
          </div>

          <div className="rounded-[28px] bg-[#fdcdbc] p-6 shadow-[0px_10px_30px_-12px_#00000030]">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#7955481a]">
              <FlaskConical className="h-5 w-5 text-[#2e150b]" aria-hidden="true" />
            </div>
            <h3 className="[font-family:'Inter-ExtraBold',Helvetica] text-2xl font-extrabold text-[#2e150b]">Precision Soil Analysis</h3>
            <p className="mt-3 [font-family:'Inter-Regular',Helvetica] text-sm leading-6 text-[#603f33]">
              Enter NPK and environmental readings manually or use device sync for faster farm diagnostics.
            </p>
            <div className="mt-5 space-y-3 border-t border-[#7a56491a] pt-4">
              {soilAnalysisParameters.map((parameter) => (
                <div key={parameter.label}>
                  <div className="flex items-center justify-between text-sm font-semibold text-[#2e150b]">
                    <span>{parameter.label}</span>
                    <span>{parameter.quality}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#795548]">{parameter.value}</div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#ffffff4c]">
                    <div className={`${parameter.width} h-full bg-[#7a5649]`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-[#e3ebdc] p-6 shadow-[0px_10px_30px_-12px_#00000030]">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#065f18]">
              <BrainCircuit className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <h3 className="[font-family:'Inter-ExtraBold',Helvetica] text-2xl font-extrabold text-[#00450d]">AI-Driven Insights</h3>
            <p className="mt-3 [font-family:'Inter-Regular',Helvetica] text-sm leading-6 text-[#41493e]">
              Soil, weather, and farm context are combined to rank crop options by confidence and risk.
            </p>
          </div>

          <div className="rounded-[28px] bg-[#cee5ff] p-6 shadow-[0px_10px_30px_-12px_#00000030]">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#003e63]">
              <CloudSunRain className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <h3 className="[font-family:'Inter-ExtraBold',Helvetica] text-2xl font-extrabold text-[#001d32]">Hyper-Local Weather</h3>
            <p className="mt-3 [font-family:'Inter-Regular',Helvetica] text-sm leading-6 text-[#004a75]">
              Plot-level forecasts and atmospheric trends help prevent weather-related losses before they hit.
            </p>
          </div>

          <div className="rounded-[28px] bg-[#00450d] p-6 text-white shadow-[0px_10px_30px_-12px_#00000030]">
            <h3 className="[font-family:'Inter-ExtraBold',Helvetica] text-2xl font-extrabold">Harvest the Future with Yield Prediction</h3>
            <p className="mt-3 [font-family:'Inter-Regular',Helvetica] text-sm leading-6 text-[#86d881]">
              Forecast harvest windows and expected volume so planning, logistics, and market timing are easier.
            </p>
          </div>
        </div>
      </div>

      <motion.div
      className="hidden lg:grid mx-auto w-full max-w-[1280px] pt-16 sm:pt-20 px-4 sm:px-8 grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-[620px_452px_505px] h-fit relative"
      variants={gridContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div className="relative col-span-1 lg:row-[1_/_2] lg:col-[9_/_13] w-full h-fit flex flex-col items-start justify-between p-6 sm:p-8 bg-[#fdcdbc] rounded-[32px] lg:rounded-[48px]" variants={cardReveal}>
        <div className="relative self-stretch w-full h-[204px]">
          <div className="flex w-14 h-14 items-center justify-center absolute top-0 left-0 bg-[#7955481a] rounded-2xl">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <FlaskConical className="relative h-[22.5px] w-[22.57px] text-[#2e150b]" aria-hidden="true" />
            </div>
          </div>

          <div className="flex flex-col w-full items-start absolute top-20 left-0">
            <div className="relative flex items-center w-[265.88px] h-[30px] mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#2e150b] text-2xl tracking-[0] leading-[30px] whitespace-nowrap">
              Precision Soil Analysis
            </div>
          </div>

          <div className="flex flex-col w-full items-start absolute top-[126px] left-0">
            <p className="relative w-[296.4px] h-[78px] mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#603f33] text-base tracking-[0] leading-[26px]">
              Capture NPK levels and core soil signals
              <br />
              like moisture and pH through manual input
              or connected farm device sync.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start pt-8 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start gap-3 pt-8 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-[#7a56491a]">
            {soilAnalysisParameters.map((parameter) => (
              <div key={parameter.label} className="relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                  <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <div className="flex items-center h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#2e150b] text-sm tracking-[0] leading-5 whitespace-nowrap relative mt-[-1.00px]">
                      {parameter.label}
                    </div>
                  </div>

                  <div className="inline-flex flex-col items-end relative flex-[0_0_auto]">
                    <div className="h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#2e150b] text-sm tracking-[0] leading-5 whitespace-nowrap relative mt-[-1.00px]">
                      {parameter.quality}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1.5 mb-2 w-full">
                  <div className="[font-family:'Inter-Regular',Helvetica] font-normal text-[#795548] text-xs tracking-[0] leading-4">
                    {parameter.value}
                  </div>
                </div>

                <div className="relative self-stretch w-full h-2 bg-[#ffffff4c] rounded-full overflow-hidden">
                  <div className={`${parameter.width} h-full bg-[#7a5649]`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="relative col-span-1 lg:row-[2_/_3] lg:col-[1_/_5] w-full min-h-[452px] bg-[#e3ebdc] rounded-[32px] lg:rounded-[48px]" variants={cardReveal}>
        <div className="w-14 h-14 justify-center absolute top-8 left-8 bg-[#065f18] flex items-center rounded-2xl">
          <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
            <BrainCircuit className="relative h-[25px] w-[23.76px] text-white" aria-hidden="true" />
          </div>
        </div>

        <div className="w-[calc(100%_-_64px)] absolute top-28 left-8 flex flex-col items-start">
          <div className="relative flex items-center w-[211.69px] h-8 mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-2xl tracking-[0] leading-8 whitespace-nowrap">
            AI-Driven Insights
          </div>
        </div>

        <div className="flex flex-col w-[calc(100%_-_64px)] items-start absolute top-40 left-8">
          <p className="w-[324.34px] h-[104px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-base tracking-[0] leading-[26px] relative mt-[-1.00px]">
            Our recommendation engine combines soil,
            <br />
            weather, and farm context signals
            <br />
            to suggest high-confidence crop options for
            <br />
            your current field conditions.
          </p>
        </div>

        <div className="flex flex-col w-[calc(100%_-_64px)] items-start gap-3 absolute top-[296px] left-8">
          <div className="gap-4 p-4 relative self-stretch w-full flex-[0_0_auto] bg-white shadow-[0px_1px_2px_#0000000d] flex items-center rounded-2xl">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <FlaskConical className="relative h-[16.99px] w-[17px] text-[#00450d]" aria-hidden="true" />
            </div>

            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="flex items-center w-[220.52px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#00450d] text-sm tracking-[0] leading-5 whitespace-nowrap relative mt-[-1.00px]">
                Soybeans: High Yield Probability
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff80] rounded-2xl">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <AlertTriangle className="relative h-[16.99px] w-[17px] text-[#41493e]" aria-hidden="true" />
            </div>

            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="flex items-center w-[145.55px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5 whitespace-nowrap relative mt-[-1.00px]">
                Maize: Moderate Risk
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="relative col-span-1 lg:row-[1_/_2] lg:col-[1_/_9] w-full h-full flex flex-col items-start justify-center p-6 sm:p-10 lg:p-12 bg-white rounded-[32px] lg:rounded-[48px] overflow-hidden" variants={cardReveal}>
        <div className="flex flex-col w-[75.00%] items-start absolute left-[34.97%] -bottom-20 rotate-[12.00deg] opacity-10">
          <div className="relative max-w-[601.98px] w-[512.01px] h-[512px] rounded-3xl aspect-[1] bg-[url(/features/Grid_2.png)] bg-cover bg-[50%_50%]" />
        </div>

        <div className="flex flex-col items-start justify-between relative self-stretch w-full h-full">
          <div className="relative self-stretch w-full h-[257px]">
            <div className="flex w-14 h-14 items-center justify-center absolute top-0 left-0 bg-[#00450d1a] rounded-2xl">
              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <MapPinned className="relative h-[22.5px] w-[22.5px] text-[#00450d]" aria-hidden="true" />
              </div>
            </div>

            <div className="w-full absolute top-[88px] left-0 flex flex-col items-start">
              <div className="relative flex items-center w-[438.64px] h-9 mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-3xl tracking-[0] leading-9 whitespace-nowrap">
                Smart Farm Location Mapping
              </div>
            </div>

            <div className="flex flex-col max-w-md w-[calc(100%_-_259px)] items-start absolute top-[140px] left-0">
              <p className="w-[447.63px] h-[117px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-lg tracking-[0] leading-[29.2px] relative mt-[-1.00px]">
                Register your farms and lock each location to power
                <br />
                soil analysis, weather lookup, and dashboard insights
                <br />
                using one consistent source of truth for every plot.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 pt-8 pb-0 px-0 relative self-stretch w-full border-t [border-top-style:solid] border-[#00450d1a]">
            <div className="grid grid-cols-3 gap-3 self-stretch w-full">
              <div className="rounded-2xl bg-[#e3ebdc] px-4 py-3">
                <div className="[font-family:'Inter-SemiBold',Helvetica] text-[10px] font-semibold tracking-[1.20px] leading-4 text-[#00450d]">
                  SELECTED FARM
                </div>
                <div className="mt-1 [font-family:'Inter-SemiBold',Helvetica] text-sm font-semibold leading-5 text-[#171d14]">
                  Active from My Farms
                </div>
              </div>
              <div className="rounded-2xl bg-[#e3ebdc] px-4 py-3">
                <div className="[font-family:'Inter-SemiBold',Helvetica] text-[10px] font-semibold tracking-[1.20px] leading-4 text-[#00450d]">
                  LOCATION MODE
                </div>
                <div className="mt-1 [font-family:'Inter-SemiBold',Helvetica] text-sm font-semibold leading-5 text-[#171d14]">
                  System locked in Soil
                </div>
              </div>
              <div className="rounded-2xl bg-[#e3ebdc] px-4 py-3">
                <div className="[font-family:'Inter-SemiBold',Helvetica] text-[10px] font-semibold tracking-[1.20px] leading-4 text-[#00450d]">
                  NEXT OUTPUT
                </div>
                <div className="mt-1 [font-family:'Inter-SemiBold',Helvetica] text-sm font-semibold leading-5 text-[#171d14]">
                  Recommendations by farm
                </div>
              </div>
            </div>

            <p className="[font-family:'Inter-Regular',Helvetica] text-sm leading-6 text-[#41493e]">
              Choose an active farm in My Farms, complete Input Soil Data, then run Get Crop Reccomendation to open farm-specific results.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="relative col-span-1 lg:row-[2_/_3] lg:col-[5_/_13] w-full min-h-[452px] bg-[#cee5ff] rounded-[32px] lg:rounded-[48px] overflow-hidden" variants={cardReveal}>
        <div className="absolute w-[calc(100%_-_465px)] top-[83px] left-20 h-[286px] flex flex-col">
          <div className="w-14 h-14 relative justify-center bg-[#003e63] flex items-center rounded-2xl">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <CloudSunRain className="relative h-[25px] w-[27.5px] text-white" aria-hidden="true" />
            </div>
          </div>

          <div className="mr-0 flex-1 max-h-9 relative mt-8 w-[337.33px] flex flex-col items-start">
            <div className="relative flex items-center w-[311.95px] h-9 mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#001d32] text-3xl tracking-[0] leading-9 whitespace-nowrap">
              Hyper-Local Weather
            </div>
          </div>

          <div className="flex mr-0 flex-1 max-h-[147px] relative mt-4 flex-col w-[337.33px] items-start">
            <p className="relative w-[334.69px] mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#004a75] text-lg tracking-[0] leading-[29.2px]">
              Don&#39;t rely on regional forecasts.
              <br />
              PiliSeed provides ultra-precise weather
              <br />
              alerts at the plot level, warning you of
              <br />
              frost, floods, or droughts before they
              <br />
              strike.
            </p>
          </div>
        </div>

        <div className="flex flex-col w-[337px] h-[194px] items-start gap-8 p-6 absolute top-[129px] left-[449px] bg-[#ffffff66] rounded-3xl border border-solid border-[#ffffff33] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]">
          <div className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-3xl shadow-[0px_8px_10px_-6px_#0000001a,0px_20px_25px_-5px_#0000001a]" />

          <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
            <div className="inline-flex flex-col items-start gap-[0.5px] relative self-stretch flex-[0_0_auto]">
              <div className="flex items-center w-[131.05px] h-4 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#003e6399] text-xs tracking-[0.60px] leading-4 whitespace-nowrap relative mt-[-1.00px]">
                CURRENT HUMIDITY
              </div>

              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#003e63] text-4xl tracking-[0] leading-10 whitespace-nowrap">
                  68%
                </div>
              </div>
            </div>

            <div className="inline-flex flex-col items-start relative self-stretch flex-[0_0_auto]">
              <Droplets className="relative h-[30px] w-6 text-[#003e63]" aria-hidden="true" />
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <div className="flex items-center w-[140.98px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#003e63] text-sm tracking-[0] leading-5 whitespace-nowrap relative mt-[-1.00px]">
                  Precipitation Chance
                </div>
              </div>

              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <div className="flex items-center w-[28.72px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#003e63] text-sm tracking-[0] leading-5 whitespace-nowrap relative mt-[-1.00px]">
                  12%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <div className="flex items-center w-[81.92px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#003e63] text-sm tracking-[0] leading-5 whitespace-nowrap relative mt-[-1.00px]">
                  Wind Speed
                </div>
              </div>

              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <div className="flex items-center w-[60.03px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#003e63] text-sm tracking-[0] leading-5 whitespace-nowrap relative mt-[-1.00px]">
                  4.2 km/h
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="relative col-span-1 lg:row-[3_/_4] lg:col-[1_/_13] w-full min-h-[505px] flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 p-8 sm:p-10 lg:p-16 bg-[#00450d] rounded-[32px] lg:rounded-[48px] overflow-hidden" variants={cardReveal}>
        <div className="flex flex-col items-start gap-6 relative flex-1 grow">
          <div className="inline-flex items-start px-4 py-1.5 relative flex-[0_0_auto] bg-[#ffffff1a] rounded-full">
            <div className="flex items-center w-[139.41px] h-4 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-xs tracking-[1.20px] leading-4 whitespace-nowrap relative mt-[-1.00px]">
              PREDICTIVE ENGINE
            </div>
          </div>

          <div className="relative self-stretch w-full flex-[0_0_auto] flex flex-col items-start">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-white text-5xl tracking-[0] leading-[48px]">
              Harvest the Future
              <br />
              with Yield Prediction
            </p>
          </div>

          <div className="flex flex-col items-start pt-0 pb-2 px-0 relative self-stretch w-full flex-[0_0_auto] opacity-90">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#86d881] text-lg tracking-[0] leading-[29.2px]">
              Plan your logistics and sales with confidence. Our
              <br />
              forecasting models provide harvest window windows and
              <br />
              volume estimates with up to 92% accuracy weeks in
              <br />
              advance.
            </p>
          </div>
        </div>

        <div className="flex flex-col h-[300px] items-start justify-center relative flex-1 grow bg-[#ffffff01] rounded-2xl overflow-hidden shadow-[0px_25px_50px_-12px_#00000040]">
          <div className="relative flex-1 self-stretch w-full grow bg-[url(/features/Grid.png)] bg-cover bg-[50%_50%]" />

          <div className="absolute w-full h-full top-0 left-0 bg-[linear-gradient(90deg,rgba(0,69,13,0.6)_0%,rgba(0,69,13,0)_100%)]" />
        </div>
      </motion.div>
    </motion.div>
    </>
  );
};
