import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TestAuthPanel } from "@/components/layout/test-auth/TestAuthPanel";

export default function TestSignupPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f5fced]">
      <Header />
      <main className="flex-1">
        <TestAuthPanel mode="signup" />
      </main>
      <Footer absolute={false} />
    </div>
  );
}
