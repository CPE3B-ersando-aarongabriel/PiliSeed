import { Header } from "@/components/layout/Header";
import { SignupSection } from "@/components/layout/signup/SignupSection";
import { Footer } from "@/components/layout/Footer";

export default function SignupPage() {
  return (
    <div className="bg-[#f5fced] w-full min-w-[1280px] min-h-screen relative">
      <Header />
      <SignupSection />
      <Footer absolute={false} />
    </div>
  );
}
