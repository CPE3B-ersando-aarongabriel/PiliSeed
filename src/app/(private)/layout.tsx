import type { ReactNode } from "react";

type PrivateLayoutProps = {
  children: ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return <>{children}</>;
}
