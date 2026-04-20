"use client";

import { useState } from "react";
import Link from 'next/link';
import QuickNavigation from "@/components/layout/QuickNavigation";
import YieldHeader from "@/components/layout/yield/YieldHeader";
import SeasonalYieldChart from "@/components/layout/yield/SeasonalYieldChart";
import EstimatedRevenueCard from "@/components/layout/yield/EstimatedRevenue";
import MarketPriceTrendsCard from "@/components/layout/yield/MarketPriceTrends";


interface MarketPrice {
  label: string;
  price: string;
  change: string;
  changeColor: string;
  isPositive: boolean;
}

interface LegendItem {
  color: string;
  label: string;
}

const marketPrices: MarketPrice[] = [
  {
    label: "WHEAT (BU)",
    price: "$6.82",
    change: "3.1%",
    changeColor: "text-[#00450d]",
    isPositive: true,
  },
  {
    label: "CORN (BU)",
    price: "$4.15",
    change: "0.8%",
    changeColor: "text-[#ba1a1a]",
    isPositive: false,
  },
];

const legendItems: LegendItem[] = [
  { color: "bg-[#00450d]", label: "Winter Wheat (+14% Est.)" },
  { color: "bg-[#7a5649]", label: "Hybrid Corn (-2% Est.)" },
];


const monthlyYieldData = [
  { month: "JAN", wheat: 65, corn: 55 },
  { month: "MAR", wheat: 70, corn: 58 },
  { month: "MAY", wheat: 85, corn: 72 },
  { month: "JUL", wheat: 92, corn: 78 },
  { month: "SEP", wheat: 88, corn: 75 },
  { month: "NOV", wheat: 75, corn: 62 },
];


const quarterlyYieldData = [
  { quarter: "Q1", wheat: 68, corn: 57 },
  { quarter: "Q2", wheat: 88, corn: 75 },
  { quarter: "Q3", wheat: 90, corn: 77 },
  { quarter: "Q4", wheat: 75, corn: 62 },
];

const farmOptions = ['Emerald Ridge Farm', 'Emerald Valley', 'Highland Ridge'];

export default function YieldPrediction() {
  const [selectedFarm, setSelectedFarm] = useState('Emerald Ridge Farm');
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#EFF6E7] py-8">
      <div className="max-w-7xl mx-auto px-12">
        <YieldHeader
          selectedFarm={selectedFarm}
          onFarmChange={setSelectedFarm}
          onRunAnalysis={handleRunAnalysis}
          isLoading={isLoading}
          isFarmDropdownOpen={isFarmDropdownOpen}
          setIsFarmDropdownOpen={setIsFarmDropdownOpen}
          farmOptions={farmOptions}
        />

        <div className="grid grid-cols-12 gap-6">
          <SeasonalYieldChart
            monthlyData={monthlyYieldData}
            quarterlyData={quarterlyYieldData}
            legendItems={legendItems}
          />

          <div className="col-span-4 flex flex-col gap-6">
            <EstimatedRevenueCard
              revenue="$428.5k"
              percentageIncrease="12.4%"
              progressWidth="75%"
            />
            <MarketPriceTrendsCard prices={marketPrices} />
          </div>
        </div>
         <QuickNavigation currentPage="yield-prediction" />
      </div>
    </div>
  );
}