import { Header } from "@/components/layout/Header";
import { LoginSection } from "@/components/layout/login/Loginsection";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  return (
    <div>
      <Header />
      <LoginSection />
      <Footer absolute={false} />
    </div>
  );
}
