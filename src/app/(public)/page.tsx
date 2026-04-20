import { Carousel } from "@/components/layout/landing/Carousel";
import { Encouragement } from "@/components/layout/Encouragement";
import { Features_summary } from "@/components/layout/landing/Features_summary";
import { Hero } from "@/components/layout/landing/Hero";
import { Howitworks_summary } from "@/components/layout/landing/Howitworks_summary";
import { Navbar } from "@/components/layout/Navbar";
import { Problem } from "@/components/layout/landing/Problem";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="bg-[#f5fced] w-full min-h-screen relative overflow-x-hidden">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <Problem />
        <Carousel />
        <Features_summary />
        <Howitworks_summary />
        <Encouragement />
        <Footer />
      </main>
    </div>
  );
}
