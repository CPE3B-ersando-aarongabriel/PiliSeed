"use client";
import { JSX, useState } from "react";

const slides = [
  {
    id: 1,
    image: "/landing/carousel.svg",
    alt: "Drone flying over a precision mapped vineyard",
    title: "Tech in the Field",
  },
  {
    id: 2,
    image: "/landing/carousel.svg",
    alt: "Drone flying over a precision mapped vineyard",
    title: "Tech in the Field",
  },
  {
    id: 3,
    image: "/landing/carousel.svg" ,
    alt: "Drone flying over a precision mapped vineyard",
    title: "Tech in the Field",
  },
];

export const Carousel = (): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col w-[1280px] items-center gap-12 px-0 py-24 absolute top-[2026px] left-1/2 -translate-x-1/2 bg-[#e3ebdc33]">
      <div className="relative max-w-screen-xl w-full h-16">
        <div className="absolute left-8 bottom-0 w-[376px] h-16 flex flex-col">
          <div className="flex flex-1 max-h-10 w-[376.36px] relative flex-col items-start">
            <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#171d14] text-4xl tracking-[-1.80px] leading-10 whitespace-nowrap">
              Harvesting Innovation
            </div>
          </div>

          <div className="flex flex-1 max-h-6 relative flex-col w-[376.36px] items-start">
            <p className="relative flex items-center w-[376.36px] h-6 mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-base tracking-[0] leading-6 whitespace-nowrap">
              Real stories from the digital frontier of agriculture.
            </p>
          </div>
        </div>

        <div className="absolute left-[1189px] bottom-0 w-[59px] h-[30px] flex items-center justify-between">
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-[27px] h-[27px] rounded-full border border-[#41493e] flex items-center justify-center bg-white hover:bg-[#f0f4ed] transition-colors"
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 1L1.5 6L6.5 11"
                stroke="#41493e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="w-[27px] h-[27px] rounded-full border border-[#41493e] flex items-center justify-center bg-white hover:bg-[#f0f4ed] transition-colors"
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 1L6.5 6L1.5 11"
                stroke="#41493e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col w-[1248px] items-start relative flex-[0_0_auto] rounded-[32px] overflow-hidden">
        <div
          className="flex items-start relative flex-[0_0_auto] transition-transform duration-500 ease-in-out"
          style={{
            width: `${slides.length * 1248}px`,
            transform: `translateX(-${currentIndex * 1248}px)`,
          }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="inline-flex flex-col min-w-[1248px] items-start px-4 py-0 relative self-stretch flex-[0_0_auto]"
            >
              <div className="inline-flex flex-col h-[400px] items-start justify-center relative rounded-[32px] overflow-hidden w-full">
                <img
                  className="relative flex-1 self-stretch w-full grow object-cover"
                  alt={slide.alt}
                  src={slide.image}
                />

                <div className="flex w-full h-full items-end p-12 absolute top-0 left-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0)_100%)]">
                  <div className="inline-flex flex-[0_0_auto] relative flex-col items-start">
                    <div className="relative flex items-center w-[234px] h-9 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-white text-3xl tracking-[0] leading-9 whitespace-nowrap">
                      {slide.title}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
