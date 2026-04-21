import type { User } from "firebase/auth";

type ApiEnvelope<T> = {
	success?: boolean;
	message?: string;
	data?: T;
	error?: {
		code?: string;
		message?: string;
	};
};

export function getApiErrorMessage(body: unknown, fallbackMessage: string) {
	if (typeof body !== "object" || body === null || !("error" in body)) {
		return fallbackMessage;
	}

	const errorObject = (body as { error?: { message?: unknown } }).error;

	if (errorObject && typeof errorObject.message === "string") {
		return errorObject.message;
	}

	return fallbackMessage;
}

export function getApiErrorCode(body: unknown) {
	if (typeof body !== "object" || body === null || !("error" in body)) {
		return "";
	}

	const errorObject = (body as { error?: { code?: unknown } }).error;

	return typeof errorObject?.code === "string" ? errorObject.code : "";
}

export function extractApiData<T>(body: unknown) {
	if (typeof body !== "object" || body === null) {
		return null;
	}

	const envelope = body as ApiEnvelope<T>;

	return envelope.data ?? null;
}

export async function fetchWithAuth(
	user: User,
	path: string,
	init: RequestInit = {},
) {
	const idToken = await user.getIdToken();

	const response = await fetch(path, {
		...init,
		headers: {
			Authorization: `Bearer ${idToken}`,
			...(init.body ? { "Content-Type": "application/json" } : {}),
			...(init.headers ?? {}),
		},
	});

	const body: unknown = await response.json().catch(() => null);

	return { response, body };
}
