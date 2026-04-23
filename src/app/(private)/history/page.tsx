import { Suspense } from "react";

import RecommendationsHistoryClient from "../recommendations/history/RecommendationsHistoryClient";

export default function HistoryPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#EFF6E7]">
					<main className="max-w-300 mx-auto px-6 py-8">
						<div className="rounded-4xl border border-[#C0C9BB1A] bg-white px-6 py-10 text-[#41493E]">
							Loading recommendation history...
						</div>
					</main>
				</div>
			}
		>
			<RecommendationsHistoryClient />
		</Suspense>
	);
}