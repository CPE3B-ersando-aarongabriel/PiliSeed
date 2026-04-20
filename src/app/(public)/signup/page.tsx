import { Header } from "@/components/layout/Header";
import { SignupSection } from "@/components/layout/signup/SignupSection";
import { Footer } from "@/components/layout/Footer";

export default function SignupPage() {
  return (
    <div className="bg-[#f5fced] w-full min-h-screen relative overflow-x-hidden flex flex-col">
      <Header />
      <div className="flex-1">
        <SignupSection />
      </div>
      <Footer absolute={false} />
    </div>
  );
}
