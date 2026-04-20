import { AnalysisExternalServiceError } from "./analysisErrors";

export type RequestJsonOptions = RequestInit & {
  timeoutMs?: number;
};

export async function requestJson<T>(
  url: string,
  options: RequestJsonOptions = {},
): Promise<T> {
  const { timeoutMs = 15000, ...requestInit } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...requestInit,
      signal: controller.signal,
    });

    const text = await response.text();
    let parsed: unknown = null;

    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      throw new AnalysisExternalServiceError(
        `External request failed with status ${response.status}.`,
        response.status,
        parsed,
      );
    }

    return parsed as T;
  } catch (error) {
    if (error instanceof AnalysisExternalServiceError) {
      throw error;
    }

    throw new AnalysisExternalServiceError(
      error instanceof Error ? error.message : "External request failed.",
      502,
      error,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

export function normalizeNumber(value: unknown, fallback: number | null = null): number | null {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
}

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}