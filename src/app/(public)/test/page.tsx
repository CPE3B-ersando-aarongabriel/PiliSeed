import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function TestAuthHomePage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f5fced]">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[#dbe8cc] bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6a8b4a]">
            Temporary QA Route
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#1d2f13]">Test Auth Tools</h1>
          <p className="mt-3 text-sm text-[#3d4f2f]">
            Use these temporary pages to generate Firebase ID tokens for API testing.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/test/signup"
              className="rounded-lg bg-[#44652a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#35501f]"
            >
              Open Test Signup
            </Link>
            <Link
              href="/test/login"
              className="rounded-lg border border-[#b8cf9f] bg-white px-4 py-2 text-sm font-semibold text-[#35501f] hover:bg-[#f2f7ea]"
            >
              Open Test Login
            </Link>
          </div>
        </div>
      </main>
      <Footer absolute={false} />
    </div>
  );
}
