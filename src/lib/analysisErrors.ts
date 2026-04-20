export class AnalysisError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "CONFIGURATION_ERROR"
      | "INVALID_INPUT"
      | "EXTERNAL_SERVICE_ERROR"
      | "ANALYSIS_ERROR" = "ANALYSIS_ERROR",
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

export class AnalysisConfigurationError extends AnalysisError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR");
    this.name = "AnalysisConfigurationError";
  }
}

export class AnalysisInvalidInputError extends AnalysisError {
  constructor(message: string) {
    super(message, "INVALID_INPUT");
    this.name = "AnalysisInvalidInputError";
  }
}

export class AnalysisExternalServiceError extends AnalysisError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message, "EXTERNAL_SERVICE_ERROR");
    this.name = "AnalysisExternalServiceError";
  }
}