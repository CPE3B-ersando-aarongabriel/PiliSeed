"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getClientAuth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
    LayoutDashboard,
    Tractor,
    FlaskConical,
    Sprout,
    CloudSun,
    TrendingUp,
  History,
    Settings,
    LogOut,
}from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Farmer");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const auth = getClientAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split("@")[0] || "Farmer";
        setUserName(name);
      }
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Weather Analysis",
      path: "/weather",
      icon: CloudSun,
    },
    {
      name: "Farms",
      path: "/farms",
      icon: Tractor,
    },
    {
      name: "Parameters",
      path: "/parameters",
      icon: FlaskConical,
    },
    {
      name: "Crop Recommendations",
      path: "/recommendations",
      icon: Sprout,
    },
    {
      name: "Yield Prediction",
      path: "/yield",
      icon: TrendingUp,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
  ];

  const mobileNavItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Weather",
      path: "/weather",
      icon: CloudSun,
    },
    {
      name: "Farms",
      path: "/farms",
      icon: Tractor,
    },
    {
      name: "Params",
      path: "/parameters",
      icon: FlaskConical,
    },
    {
      name: "Recs",
      path: "/recommendations",
      icon: Sprout,
    },
    {
      name: "Yield",
      path: "/yield",
      icon: TrendingUp,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: Settings,
    },
  ];

      const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
          const auth = getClientAuth();
          await auth.signOut();
          router.push("/");
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          setIsLoggingOut(false);
        }
      };

  return (
    <>
      <div
        className={`
            hidden lg:flex lg:sticky top-0 left-0 z-50
            h-screen w-72 bg-[#E9F0E1] border-r border-gray-200 flex-col
        `}
      >
        <div className="px-6 pt-8 pb-6 border-gray-100 flex justify-between items-center">
          <div>
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <img
                src="/Pili-logo-main.png"
                alt="PiliSeed logo"
                className="w-8 h-8 object-contain"
                loading="eager"
              />
              <h1 className="text-2xl font-bold text-[#00450D]">PiliSeed</h1>
            </Link>
            <p className="text-[#171D14]/60 text-sm font-medium mt-0.5">
              Digital Greenhouse
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-3xl transition-all duration-200 text-sm group ${
                      isActive
                        ? "bg-white text-[#00450D] font-semibold"
                        : "text-[#171D14]/70 font-medium hover:bg-white hover:text-[#00450D] hover:font-semibold"
                    }`}
                  >
                   
                    {(() => {
                      const Icon = item.icon as any;
                      return (
                        <Icon
                          className={`w-5.5 h-5.5 transition-colors duration-200 ${
                            isActive ? "text-[#00450D]" : "text-[#171D14]/70 group-hover:text-[#00450D]"
                          }`}
                        />
                      );
                    })()}

                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 pb-6 mt-auto">
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex-1 bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-between border border-[#171D14]/5 shadow-sm hover:bg-white/80 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00450D] to-[#008822] flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#171D14] wrap-break-word">
                  {userName}
                </p>
              </div>

              <Settings className="w-5 h-5 cursor-pointer text-[#41493E]" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-12 w-12 shrink-0 rounded-2xl border border-[#C62828]/30 bg-[#FDECEC] text-[#C62828] transition-colors hover:bg-[#F9DDDD] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="mx-auto h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#171D14]/10 bg-[#E9F0E1]/95 backdrop-blur-sm px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 lg:hidden">
        <ul className="flex items-end gap-1 overflow-x-auto whitespace-nowrap pb-1">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon as any;

            return (
              <li key={item.name} className="min-w-[74px] shrink-0">
                <Link
                  href={item.path}
                  className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors ${
                    isActive
                      ? "bg-white text-[#00450D]"
                      : "text-[#171D14]/70 hover:bg-white/70 hover:text-[#00450D]"
                  }`}
                >
                  <Icon className="mb-1 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
          <li className="min-w-[74px] shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold text-[#C62828] transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="mb-1 h-5 w-5" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
