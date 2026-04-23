export type EmailJsServerConfig = {
  serviceId: string;
  templateId: string;
  publicKey: string;
  privateKey?: string;
};

export function getEmailJsServerConfig(): EmailJsServerConfig | null {
  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();

  if (!serviceId || !templateId || !publicKey) {
    return null;
  }

  return {
    serviceId,
    templateId,
    publicKey,
    privateKey,
  };
}

export type EmailJsTemplateParams = Record<string, string>;

export function buildEmailJsSendPayload(
  config: EmailJsServerConfig,
  templateParams: EmailJsTemplateParams,
) {
  return {
    service_id: config.serviceId,
    template_id: config.templateId,
    user_id: config.publicKey,
    ...(config.privateKey ? { accessToken: config.privateKey } : {}),
    template_params: templateParams,
  };
}
