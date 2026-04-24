"use client";

import { TrendingUp, TrendingDown, Store } from "lucide-react";

import type {
  MarketSnapshot,
  MarketSourceInfo,
} from "@/lib/marketTypes";

interface MarketPrice {
  label: string;
  price: string;
  change: string;
  changeColor: string;
  isPositive: boolean;
}

interface MarketPriceTrendsCardProps {
  prices: MarketPrice[];
  marketSnapshot?: MarketSnapshot | null;
  marketSource?: MarketSourceInfo | null;
}

function getSourceLabel(source: MarketSourceInfo | null | undefined) {
  if (!source) return "Market feed unavailable";
  const providerLabel =
    source.provider === "openai" ? "OpenAI fallback" : "Anomura.today";
  return source.date ? `${providerLabel} • ${source.date}` : providerLabel;
}

/** Truncate a commodity label to a max character count, appending ellipsis. */
function truncateLabel(label: string, maxLen = 42): string {
  if (label.length <= maxLen) return label;
  return label.slice(0, maxLen - 1).trimEnd() + "…";
}

/** Title-case a slug-like string: "WATER_SPINACH_KANGKONG" → "Water Spinach Kangkong" */
function formatCommodityName(raw: string): string {
  return raw
    .replace(/[_\-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MarketPriceTrendsCard({
  prices,
  marketSnapshot,
  marketSource,
}: MarketPriceTrendsCardProps) {
  const resolvedVariants = marketSnapshot?.variants ?? [];

  return (
    <div className="market-trends-card bg-[#FDCDBC] rounded-4xl p-5 flex flex-col min-h-0 h-full w-full shadow-md overflow-y-auto">
      {/* ── Header ── */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-semibold text-[#7A5649] text-xs tracking-wider uppercase truncate">
            Market Price Trends
          </span>
          <p className="font-normal text-[#7A5649]/55 text-[10px] leading-[14px] truncate">
            {getSourceLabel(marketSource)}
          </p>
        </div>
        <div className="shrink-0 bg-[#7A5649]/10 rounded-xl p-1.5">
          <Store className="w-4 h-4 text-[#7A5649]" />
        </div>
      </div>

      {/* ── Main price list ── */}
      <div className="flex flex-col gap-2.5">
        {prices.length === 0 ? (
          <p className="text-xs font-medium text-[#7A5649]/60 italic">
            Market pricing will appear once a forecast is available.
          </p>
        ) : (
          prices.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white/50 px-3 py-2.5 flex flex-col gap-1"
            >
              {/* Label + price on one row, wrapping gracefully */}
              <div className="flex items-start justify-between gap-2">
                {/*
                  Long label: allow wrapping, but clamp to 3 lines max.
                  "break-words" ensures very long tokens (like slug strings) wrap.
                */}
                <span
                  className="text-[11px] font-semibold leading-[1.35] text-[#7A5649]/80 break-words min-w-0 line-clamp-3"
                  title={item.label}
                >
                  {item.label}
                </span>

                {/* Price: shrink-0 so it never gets squished */}
                <span className="shrink-0 font-bold text-[#7A5649] text-sm leading-tight whitespace-nowrap">
                  {item.price}
                </span>
              </div>

              {/* Change badge */}
              <div
                className={`inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[10px] font-semibold
                  ${item.isPositive
                    ? "bg-[#00450D]/10 text-[#00450D]"
                    : "bg-[#AA5649]/10 text-[#AA5649]"
                  }`}
              >
                {item.isPositive ? (
                  <TrendingUp className="w-3 h-3 shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 shrink-0" />
                )}
                <span className="truncate max-w-[12rem]">{item.change}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Variant chips ── */}
      {resolvedVariants.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {resolvedVariants.map((variant, index) => {
            const displayName = formatCommodityName(variant.commodityName);
            const truncatedName = truncateLabel(displayName, 48);
            const needsTitle = truncatedName !== displayName;

            return (
              <div
                key={`${variant.commodityName}-${variant.score}-${variant.date ?? "no-date"}-${index}`}
                className="rounded-2xl bg-white/65 px-3 py-2 text-[#7A5649] shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  {/*
                    Commodity name: prettified + safely truncated.
                    "overflow-hidden" + "break-words" handles both long pretty names
                    and pathological slug-style strings that survive formatCommodityName.
                  */}
                  <span
                    className="min-w-0 text-[11px] font-semibold leading-snug break-words line-clamp-2 overflow-hidden"
                    title={needsTitle ? displayName : undefined}
                  >
                    {truncatedName}
                  </span>

                  <span className="shrink-0 whitespace-nowrap text-right text-xs font-bold">
                    PHP {variant.price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] font-medium text-[#7A5649]/70">
                  <span className="truncate">{variant.category ?? "Uncategorized"}</span>
                  <span className="shrink-0 whitespace-nowrap">{variant.date ?? "No date"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .market-trends-card {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .market-trends-card::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}