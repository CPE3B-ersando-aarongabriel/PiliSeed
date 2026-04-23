# EmailJS Configuration (Forgot Password)

This project sends password reset emails from the server route at `src/app/api/auth/forgot-password/route.ts` using EmailJS REST API.

## 1. Required environment variables

Add these values to `.env`:

```env
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=xxxxxxxxxxxxxxxx
```

Notes:
- `EMAILJS_PRIVATE_KEY` is optional in code, but recommended for server-side sends.
- If required values are missing, the API keeps working in simulated mode and logs reset links to the server console.

## 2. EmailJS template variables

Your EmailJS template must define these exact variables, because the server sends this payload shape:

- `to_email`
- `reset_link`

The API also sends fallback aliases for compatibility:

- `email`
- `user_email`
- `recipient_email`
- `to`
- `link`

Example EmailJS payload sent by the API:

```json
{
  "service_id": "service_xxxxxxx",
  "template_id": "template_xxxxxxx",
  "user_id": "public_key_here",
  "accessToken": "private_key_here",
  "template_params": {
    "to_email": "farmer@example.com",
    "reset_link": "https://your-domain/reset-password?token=...&email=..."
  }
}
```

## 3. Suggested template content

Subject:

```text
Reset your PiliSeed password
```

Body:

```text
Hello,

We received a request to reset your PiliSeed password.

Use this secure link:
{{reset_link}}

If you did not request this, you can ignore this email.
```

Recipient field:

- Use `{{to_email}}` as the destination email.

## 5. Troubleshooting (422 recipients address is empty)

If you see this error, your EmailJS template recipient mapping is blank or points to a different variable name.

Fix in EmailJS template settings:

1. Set **To Email** to `{{to_email}}` (recommended) or `{{email}}`.
2. Ensure the value is not empty in test/send preview.
3. Re-test `/api/auth/forgot-password`.

## 4. Local verification

1. Start app: `npm run dev`
2. Open `/forgot-password`
3. Submit an existing Firebase Auth email.
4. Check API response field `emailDelivery` and your inbox.
5. If delivery fails, inspect server logs for `[ForgotPassword] EmailJS send failed`.
