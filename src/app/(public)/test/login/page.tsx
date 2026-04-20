import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TestAuthPanel } from "@/components/layout/test-auth/TestAuthPanel";

export default function TestLoginPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f5fced]">
      <Header />
      <main className="flex-1">
        <TestAuthPanel mode="login" />
      </main>
      <Footer absolute={false} />
    </div>
  );
}
