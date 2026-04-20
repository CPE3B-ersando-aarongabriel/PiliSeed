import { UnauthorizedError } from "./authMiddleware";

function getDeviceToken() {
	const token = process.env.ESP32_DEVICE_TOKEN?.trim();

	if (!token) {
		throw new Error("Missing required ESP32_DEVICE_TOKEN environment variable.");
	}

	return token;
}

export function verifyDeviceToken(request: Request) {
	const configuredToken = getDeviceToken();
	const providedToken = request.headers.get("x-device-token")?.trim();

	if (!providedToken || providedToken !== configuredToken) {
		throw new UnauthorizedError("Invalid device token.");
	}

	return configuredToken;
}
