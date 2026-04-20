import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function PrivateLayout({ children, }: {children: React.ReactNode}) {
  return (
    <div className = "flex min-h-screen bg-[#EFF6E7]">
      <Sidebar/>
      <main className="flex-1 overflow-x-hidden p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
