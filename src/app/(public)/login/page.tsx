import { Header } from "@/components/layout/Header";
import { LoginSection } from "@/components/layout/login/Loginsection";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f5fced]">
      <Header />
      <div className="flex-1">
        <LoginSection />
      </div>
      <Footer absolute={false} />
    </div>
  );
}
