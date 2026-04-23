import { getAnalysisProviderConfig } from "./analysisEnv";
import { AnalysisConfigurationError } from "./analysisErrors";
import { requestJson } from "./analysisHttp";

type OpenAIServiceConfig = {
  baseUrl?: string | null;
  apiKey?: string;
  model?: string;
};

type OpenAIResponsePayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function extractResponseText(payload: OpenAIResponsePayload): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const outputText =
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content?.type === "output_text" && typeof content.text === "string")?.text ?? "";

  return outputText.trim();
}

export function createOpenAIService(config: OpenAIServiceConfig = {}) {
  const providerConfig = config.apiKey
    ? {
        apiKey: config.apiKey,
        baseUrl: config.baseUrl ?? "https://api.openai.com/v1",
      }
    : getAnalysisProviderConfig("openai");

  const baseUrl = providerConfig.baseUrl ?? "https://api.openai.com/v1";
  const model = config.model ?? "gpt-4.1-mini";

  if (!providerConfig.apiKey.trim()) {
    throw new AnalysisConfigurationError("Missing OpenAI API key.");
  }

  async function generateText(prompt: string): Promise<string> {
    const payload = await requestJson<OpenAIResponsePayload>(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    });

    const text = extractResponseText(payload);

    if (!text) {
      throw new AnalysisConfigurationError("OpenAI returned an empty response.");
    }

    return text;
  }

  async function generateJson(prompt: string): Promise<Record<string, unknown>> {
    const text = await generateText(prompt);

    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      return parsed;
    } catch (error) {
      const parseError = error instanceof Error ? error.message : "Unknown error";
      throw new AnalysisConfigurationError(
        `OpenAI returned invalid JSON. Parse error: ${parseError}. Response: ${text.slice(0, 200)}...`
      );
    }
  }

  return {
    generateText,
    generateJson,
  };
}