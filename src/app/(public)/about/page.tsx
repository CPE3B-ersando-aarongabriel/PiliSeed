import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { About_Body } from "@/components/layout/about/About_Body";
import { Encouragement } from "@/components/layout/Encouragement";


export default function About() {
 return (
    <div className="bg-[#f5fced] w-full min-w-[1280px] min-h-screen relative">
      <Navbar />
      <About_Body />
      <Encouragement className="mb-20" />
      <Footer absolute={false} />
    </div>
  );
}