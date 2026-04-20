import Link from "next/link";

interface CropRecommendationData {
  name: string;
  suitabilityScore: number;
  description?: string;
}

interface CropRecommendationCardProps {
  recommendation: CropRecommendationData;
}

export default function CropRecommendationCard({
  recommendation,
}: CropRecommendationCardProps) {
  return (
    <div className="w-full bg-[#00450D] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md flex flex-col h-full">
      <div className="flex items-center gap-2 sm:gap-3 mb-4">
        <div className="rounded-xl sm:rounded-2xl bg-[#065F18] p-1.5 sm:p-2 w-fit">
          <img
            src="/dashboard/crop-recommendation.svg"
            alt="crop recommendation icon"
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Crop <br /> Recommendation
        </h2>
      </div>

      <div className="mb-4 sm:mb-6">
        <p className="text-2xl sm:text-3xl font-bold text-white break-words">
          {recommendation.name}
        </p>

        <div className="mt-2 sm:mt-3">
          <div className="rounded-full bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 inline-block">
            <p className="text-[10px] sm:text-xs font-semibold text-white/90">
              Suitability Score:{" "}
              <span className="font-bold text-white">
                {recommendation.suitabilityScore}%
              </span>
            </p>
          </div>
        </div>

        {recommendation.description && (
          <p className="text-white/80 text-xs sm:text-sm mt-3 line-clamp-2">
            {recommendation.description}
          </p>
        )}
      </div>

      <div className="flex-1"></div>

      <Link
        href="/crop-recommendations"
        className="text-[#00450D] text-xs sm:text-sm font-semibold bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 inline-block text-center hover:bg-white/90 transition flex items-center justify-center gap-2"
      >
        <span>View Full Analysis</span>
        <img
          src="/dashboard/arrow.svg"
          alt="arrow right"
          className="w-3 h-3 inline"
        />
      </Link>
    </div>
  );
}
