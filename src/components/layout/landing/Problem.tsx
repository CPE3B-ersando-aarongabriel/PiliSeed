import { JSX } from "react";
import { Leaf } from "lucide-react";

const stats = [
  {
    value: "30%",
    label: "WASTE REDUCTION",
    color: "#00450d",
    borderColor: "border-[#00450d]",
  },
  {
    value: "2.4x",
    label: "EFFICIENCY GAIN",
    color: "#003e63",
    borderColor: "border-[#003e63]",
  },
];

export const Problem = (): JSX.Element => {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:gap-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="flex w-full flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-12 bg-[#00450d]" />
            <div className="[font-family:'Manrope-Bold',Helvetica] text-[#00450d] text-sm font-bold tracking-[1.4px] leading-5 whitespace-nowrap">
              GLOBAL IMPACT
            </div>
          </div>

          <h2 className="[font-family:'Inter-ExtraBold',Helvetica] text-transparent text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight sm:leading-[1.15] lg:leading-[60px]">
            <span className="text-[#171d14] tracking-[-1.2px] sm:tracking-[-1.6px] lg:tracking-[-1.8px]">
              Addressing the
            </span>{" "}
            <span className="text-[#7a5649] tracking-[0] underline">
              Global Crisis
            </span>{" "}
            <span className="text-[#171d14] tracking-[-1.2px] sm:tracking-[-1.6px] lg:tracking-[-1.8px]">
              of Food Security.
            </span>
          </h2>

          <p className="[font-family:'Inter-Regular',Helvetica] text-[#41493e] text-base sm:text-lg lg:text-xl font-normal leading-7 sm:leading-8 tracking-[0] max-w-2xl">
            By 2050, the world will need to produce 70% more food. Traditional
            farming methods are struggling against climate change. PiliSeed
            aligns with UN Sustainable Development Goals (SDG 2: Zero Hunger and
            SDG 12: Responsible Consumption) to revolutionize how we nourish the
            planet.
          </p>

          <div className="grid w-full grid-cols-1 gap-4 pt-2 sm:grid-cols-2 sm:gap-6 lg:pt-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`flex w-full flex-col items-start gap-1.5 border-l-4 ${stat.borderColor} pl-4`}
              >
                <div
                  className="[font-family:'Inter-ExtraBold',Helvetica] text-2xl sm:text-3xl font-extrabold leading-9 tracking-[0]"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="[font-family:'Inter-SemiBold',Helvetica] text-[#41493e] text-sm font-semibold leading-5 tracking-[0]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center lg:justify-end">
          <div className="absolute hidden h-[92%] w-[92%] rounded-full bg-[#00450d0d] -top-8 right-4 lg:block" />

          <div className="relative w-full max-w-[620px] overflow-visible">
            <div className="aspect-[5/4] sm:aspect-[6/5] lg:aspect-[5/4] w-full rounded-[24px] sm:rounded-[32px] shadow-[0px_25px_50px_-12px_#00000040] bg-[url(/landing/Problem.png)] bg-cover bg-[50%_50%]" />

            <div className="absolute -bottom-5 left-1/2 flex w-[min(92%,360px)] -translate-x-1/2 items-center gap-3 rounded-[28px] bg-white p-4 shadow-[0px_8px_10px_-6px_#0000001a,0px_20px_25px_-5px_#0000001a] sm:-bottom-6 sm:gap-4 sm:rounded-[32px] sm:p-5 lg:left-8 lg:translate-x-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffdbcf] sm:h-12 sm:w-12">
                <Leaf
                  className="h-4 w-4 text-[#7a5649] sm:h-[17px] sm:w-[17px]"
                  aria-label="Leaf icon"
                />
              </div>

              <div className="flex min-w-0 flex-col items-start">
                <div className="[font-family:'Manrope-Bold',Helvetica] text-[#171d14] text-sm sm:text-base font-bold leading-6 tracking-[0]">
                  SDG Aligned
                </div>
                <div className="[font-family:'Inter-Regular',Helvetica] text-[#41493e] text-xs font-normal leading-4 tracking-[0]">
                  Sustainable Agriculture 2.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
