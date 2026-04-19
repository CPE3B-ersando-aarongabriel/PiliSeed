import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HIW_Body } from "@/components/layout/how-it-works/HIW_Body";
import { Encouragement } from "@/components/layout/Encouragement";

export default function HowItWorks() {
 return (
    <div className="bg-[#f5fced] w-full min-w-[1280px] min-h-screen relative">
      <Navbar />
      <HIW_Body />
      <Encouragement className="mb-20" />
      <Footer absolute={false} />
    </div>
  );
}