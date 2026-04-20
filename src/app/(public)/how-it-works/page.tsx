import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HIW_Body } from "@/components/layout/how-it-works/HIW_Body";
import { Encouragement } from "@/components/layout/Encouragement";

export default function HowItWorks() {
 return (
    <div className="bg-[#f5fced] w-full min-h-screen relative overflow-x-hidden flex flex-col">
      <Navbar />
      <HIW_Body />
      <Encouragement className="mb-20" />
      <Footer absolute={false} />
    </div>
  );
}