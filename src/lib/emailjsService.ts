import {
  buildEmailJsSendPayload,
  getEmailJsServerConfig,
} from "./emailjsConfig";

export type EmailDeliveryResult = {
  delivered: boolean;
  reason: string;
};

export async function sendResetLinkEmail(
  email: string,
  resetLink: string,
): Promise<EmailDeliveryResult> {
  const emailJsConfig = getEmailJsServerConfig();

  if (!emailJsConfig) {
    return { delivered: false, reason: "EmailJS is not configured" };
  }

  const payload = buildEmailJsSendPayload(emailJsConfig, {
    // Support common EmailJS template field names for recipient mapping.
    to_email: email,
    email,
    user_email: email,
    recipient_email: email,
    to: email,
    reset_link: resetLink,
    link: resetLink,
  });

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");

    if (response.status === 422 && bodyText.toLowerCase().includes("recipients address is empty")) {
      throw new Error(
        "EmailJS rejected the message because recipient mapping is empty. In your EmailJS template, set 'To email' to {{to_email}} (or {{email}}), then try again.",
      );
    }

    throw new Error(`EmailJS failed with status ${response.status}: ${bodyText.slice(0, 240)}`);
  }

  return { delivered: true, reason: "EmailJS delivery request accepted" };
}