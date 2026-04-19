import {Navbar} from "@/components/layout/Navbar";
import { Hero_features } from "../../../components/layout/features/Hero_features";
import { Grid_features } from "../../../components/layout/features/Grid_features";
import { Encouragement } from "@/components/layout/Encouragement";
import { Footer } from "@/components/layout/Footer";
export default function Features() {
  return (
    <div className="bg-[#f5fced] w-full min-w-[1280px] min-h-screen relative">
      <Navbar />
      <Hero_features />
      <Grid_features />
      <Encouragement className="mt-20" />
      <Footer absolute={false} />
    </div>
  );
}