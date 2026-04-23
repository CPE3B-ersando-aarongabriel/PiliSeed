import type { RecommendationItem } from "./analysisContracts";

export type RecommendationSessionRecord = {
	id: string;
	farmId: string;
	recommendedCrops: RecommendationItem[];
	analysisText: string;
	warningFlags: string[];
	generatedBy: "deterministic" | "openai" | "hybrid";
	recommendationJson: Record<string, unknown> | null;
	createdAt: string | null;
	updatedAt: string | null;
};

export type RecommendationSession = {
	sessionId: string;
	sessionCreatedAt: string | null;
	records: RecommendationSessionRecord[];
	latestRecord: RecommendationSessionRecord;
};

function toTimestampValue(value: string | null) {
	if (!value) {
		return 0;
	}

	const parsedDate = new Date(value);

	return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

export function getRecommendationSessionId(
	record: RecommendationSessionRecord,
) {
	const sessionId =
		typeof record.recommendationJson?.sessionId === "string"
			? record.recommendationJson.sessionId.trim()
			: "";

	return sessionId || record.id;
}

export function groupRecommendationsBySession(
	records: RecommendationSessionRecord[],
) {
	const sortedRecords = [...records].sort((firstRecord, secondRecord) => {
		return toTimestampValue(secondRecord.createdAt) - toTimestampValue(firstRecord.createdAt);
	});

	const sessions = new Map<string, RecommendationSession>();

	for (const record of sortedRecords) {
		const sessionId = getRecommendationSessionId(record);
		const existingSession = sessions.get(sessionId);

		if (existingSession) {
			existingSession.records.push(record);
			continue;
		}

		sessions.set(sessionId, {
			sessionId,
			sessionCreatedAt: record.createdAt,
			records: [record],
			latestRecord: record,
		});
	}

	return Array.from(sessions.values()).map((session) => ({
		...session,
		sessionCreatedAt:
			session.records[session.records.length - 1]?.createdAt ?? session.sessionCreatedAt,
	}));
}

export function getLatestRecommendationSession(
	records: RecommendationSessionRecord[],
) {
	return groupRecommendationsBySession(records)[0] ?? null;
}