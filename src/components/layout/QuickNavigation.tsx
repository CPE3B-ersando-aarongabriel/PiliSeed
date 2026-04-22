"use client";

import Link from "next/link";
import {
  FlaskConical,
  LucideIcon,
  Sprout,
  CloudSun,
  TrendingUp,
}from "lucide-react";

interface NavigationItem {
  id: string;
  path: string;
  bgCard: string;
  borderCard: string;
  bgIcon: string;
  icon?: LucideIcon; 
  iconColor?: string;
  label: string;
  labelClass: string;
}

const allNavigationItems: Record<string, NavigationItem> = {
  "soil-data": {
    id: "soil-data",
    path: "/soil",
    bgCard: "bg-[#065F181A]",
    borderCard: "border-[#065F1833]",
    bgIcon: "bg-[#065F18]",
    icon: FlaskConical,
    iconColor: "text-[#86D881]",
    label: "SOIL DATA ANALYSIS",
    labelClass: "text-[#065F18]",
  },
  "crop-recommendations": {
    id: "crop-recommendations",
    path: "/recommendations",
    bgCard: "bg-[#065F181A]",
    borderCard: "border-[#065F1833]",
    bgIcon: "bg-[#065F18]",
    icon: Sprout,
    iconColor: "text-[#86D881]",
    label: "CROP RECOMMENDATION",
    labelClass: "text-[#065F18]",
  },
  "weather-analysis": {
    id: "weather-analysis",
    path: "/weather",
    bgCard: "bg-[#0056871a]",
    borderCard: "border-[#00568733]",
    bgIcon: "bg-[#005687]",
    icon: CloudSun,
    iconColor: "text-[#93CBFF]",
    label: "WEATHER ANALYSIS",
    labelClass: "text-[#005687]",
  },
  "yield-prediction": {
    id: "yield-prediction",
    path: "/yield",
    bgCard: "bg-[#fdcdbc33]",
    borderCard: "border-[#FDCDBC4C]",
    bgIcon: "bg-[#7A5649]",
    icon: TrendingUp,
    iconColor: "text-[#FFFFFF]",
    label: "YIELD PREDICTION",
    labelClass: "text-[#7A5649]",
  },
};

const excludePages: Record<string, string[]> = {
  "soil-data": ["soil-data"],
  "crop-recommendations": ["crop-recommendations"],
  "weather-analysis": ["weather-analysis"],
  "yield-prediction": ["yield-prediction"],
};

interface QuickNavigationProps {
  currentPage:
    | "soil-data"
    | "crop-recommendations"
    | "weather-analysis"
    | "yield-prediction";
}

export default function QuickNavigation({ currentPage }: QuickNavigationProps) {
  const excludeList = excludePages[currentPage];

  const navigationItems = Object.values(allNavigationItems).filter(
    (item) => !excludeList.includes(item.id),
  );

  return (
    <div className="pt-8 mt-8">
      <div className="flex flex-col items-start gap-5 w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="w-6 h-1 bg-[#00450D] rounded-full" />
          <h2 className="font-extrabold text-[#171D14] text-lg">
            Quick Navigation
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`${item.bgCard} ${item.borderCard} flex flex-col items-center sm:items-center justify-center gap-4 sm:gap-5 py-6 sm:py-8 lg:py-10 px-4 w-full rounded-2xl border shadow-sm hover:shadow-md transition-shadow`}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${item.bgIcon}`}
              >
                {item.icon && <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />}
              </div>
              <span
                className={`font-semibold text-[11px] sm:text-xs text-center tracking-[1px] sm:tracking-[1.2px] ${item.labelClass}`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
