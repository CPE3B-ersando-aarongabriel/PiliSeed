import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResetPasswordView } from "@/components/auth/ResetPasswordView";

export default function ResetPasswordPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f5fced]">
      <Header />
      <div className="flex-1">
        <ResetPasswordView />
      </div>
      <Footer absolute={false} />
    </div>
  );
}
