import type { ReactNode } from "react";
import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import PrivateRouteGuard from "@/components/auth/PrivateRouteGuard";

export default function PrivateLayout({ children, }: {children: ReactNode}) {
  return (
    <PrivateRouteGuard>
      <div className = "flex min-h-screen bg-[#EFF6E7]">
        <Sidebar/>
        <main className="flex-1 overflow-x-hidden px-4 pb-4 pt-20 md:px-6 md:pb-6 md:pt-20 lg:p-6">
          <Suspense fallback={<div className="p-6">Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </PrivateRouteGuard>
  );
}
