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
    image: "/landing/carousel.svg",
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
    <section className="w-full bg-[#e3ebdc33]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:gap-10 sm:px-8 sm:py-20 lg:gap-12 lg:py-24">
        <div className="flex w-full flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex w-full max-w-2xl flex-col gap-2 sm:gap-3">
            <h2 className="[font-family:'Inter-ExtraBold',Helvetica] text-[#171d14] text-3xl sm:text-4xl font-extrabold tracking-[-1.2px] sm:tracking-[-1.8px] leading-tight">
              Harvesting Innovation
            </h2>
            <p className="[font-family:'Inter-Regular',Helvetica] text-[#41493e] text-sm sm:text-base font-normal tracking-[0] leading-6">
              Real stories from the digital frontier of agriculture.
            </p>
          </div>

          <div className="flex h-[34px] w-[76px] shrink-0 items-center justify-between">
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="h-8 w-8 rounded-full border border-[#41493e] bg-white flex items-center justify-center hover:bg-[#f0f4ed] transition-colors"
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
              className="h-8 w-8 rounded-full border border-[#41493e] bg-white flex items-center justify-center hover:bg-[#f0f4ed] transition-colors"
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

        <div className="w-full overflow-hidden rounded-[24px] sm:rounded-[32px]">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="w-full min-w-full">
                <div className="relative h-[280px] sm:h-[360px] lg:h-[420px] overflow-hidden rounded-[24px] sm:rounded-[32px]">
                  <img
                    className="h-full w-full object-cover"
                    alt={slide.alt}
                    src={slide.image}
                  />

                  <div className="absolute inset-0 flex items-end p-5 sm:p-8 lg:p-12 bg-[linear-gradient(0deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0)_100%)]">
                    <div className="[font-family:'Manrope-Bold',Helvetica] text-white text-2xl sm:text-3xl font-bold leading-tight tracking-[0]">
                      {slide.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
