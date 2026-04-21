"use client";
import { JSX, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sprout } from "lucide-react";

type Slide = {
  id: number;
  alt: string;
  title: string;
  description: string;
  imageSrc?: string;
};

const slides: Slide[] = [
  {
    id: 1,
    alt: "Farmer inspecting a tablet beside healthy crop rows",
    title: "Precision Farming in Action",
    description:
      "Track soil health, moisture, and growth patterns in real time from one dashboard.",
    imageSrc: "/landing/Carousel_3_wide.png",
  },
  {
    id: 2,
    alt: "Close-up of irrigation lines watering a vegetable field",
    title: "Smarter Farming, Better Yields",
    description:
      "Use predictive insights to reduce water waste while keeping your crops consistently nourished.",
    imageSrc: "/landing/Carousel_2_wide.png",
  },
  {
    id: 3,
    alt: "Group of local farmers reviewing field analytics together",
    title: "Communities Growing Together",
    description:
      "Share farm performance trends and build climate-resilient strategies with nearby growers.",
    imageSrc: "/landing/Carousel_wide.png",
  },
];

export const Carousel = (): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const DRAG_THRESHOLD_PX = 60;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartXRef.current = event.clientX;
    isDraggingRef.current = true;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;

    if (Math.abs(deltaX) >= DRAG_THRESHOLD_PX) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    dragStartXRef.current = null;
    isDraggingRef.current = false;
  };

  const handlePointerCancel = () => {
    dragStartXRef.current = null;
    isDraggingRef.current = false;
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
              <ChevronLeft className="h-3.5 w-3.5 text-[#41493e]" aria-hidden="true" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="h-8 w-8 rounded-full border border-[#41493e] bg-white flex items-center justify-center hover:bg-[#f0f4ed] transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5 text-[#41493e]" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className="w-full overflow-hidden rounded-[24px] sm:rounded-[32px] cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="w-full min-w-full">
                <div className="relative h-[240px] sm:h-[320px] lg:h-[400px] overflow-hidden rounded-[24px] sm:rounded-[32px]">
                  {slide.imageSrc ? (
                    <img
                      src={slide.imageSrc}
                      alt={slide.alt}
                      className="h-full w-full object-cover scale-[1.02]"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,#2f5f2f_0%,#17381c_45%,#0e1f12_100%)]">
                      <Sprout className="h-24 w-24 text-[#a3f69c] sm:h-28 sm:w-28" aria-label={slide.alt} />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-end p-5 sm:p-8 lg:p-12 bg-[linear-gradient(0deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0)_100%)]">
                    <div className="flex max-w-2xl flex-col gap-2 sm:gap-3">
                      <div className="[font-family:'Manrope-Bold',Helvetica] text-white text-2xl sm:text-3xl font-bold leading-tight tracking-[0]">
                        {slide.title}
                      </div>
                      <p className="[font-family:'Inter-Medium',Helvetica] text-[#e8f5e0] text-sm sm:text-base font-medium tracking-[0] leading-6">
                        {slide.description}
                      </p>
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
