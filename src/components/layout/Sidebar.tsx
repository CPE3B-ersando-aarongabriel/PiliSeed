"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    Menu,
    Settings,
    X,
}from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Farmer");
  const [isOpen, setIsOpen] = useState(false);

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
      name: "History",
      path: "/history",
      icon: History,
    },
    {
      name: "Weather Analysis",
      path: "/weather",
      icon: CloudSun,
    },
    {
      name: "Yield Prediction",
      path: "/yield",
      icon: TrendingUp,
    },
  ];

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#00450D] p-2 rounded-lg shadow"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen w-72 bg-[#E9F0E1] border-r border-gray-200 flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
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

          <button
            className="lg:hidden text-xl text-[#41493E] hover:text-[#00450D]"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    onClick={() => setIsOpen(false)}
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
          <Link href="/profile" className="w-full bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-between border border-[#171D14]/5 shadow-sm hover:bg-white/80 transition-all duration-200 cursor-pointer">
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

            <Settings className="w-5 h-5 cursor-pointer  text-[#41493E]"/>
          </Link>
        </div>
      </div>
    </>
  );
}
