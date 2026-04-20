import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ToastProvider from "@/components/layout/ToastProvider";

export const metadata: Metadata = {
  title: "PiliSeed",
  description: "PiliSeed web application",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
