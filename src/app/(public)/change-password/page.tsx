import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForgotPasswordView } from "@/components/auth/ForgotPasswordView";

export default function ChangePasswordPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f5fced]">
      <Header />
      <div className="flex-1">
        <ForgotPasswordView title="Change Password" />
      </div>
      <Footer absolute={false} />
    </div>
  );
}
