"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

type ForgotPasswordViewProps = {
  title?: string;
  backHref?: string;
  backLabel?: string;
};

export function ForgotPasswordView({
  title = "Forgot Password",
  backHref = "/login",
  backLabel = "Back to Login",
}: ForgotPasswordViewProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      setSuccessMessage("");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        const message =
          body?.error?.message ??
          "We could not generate a reset link right now. Please try again.";

        setErrorMessage(message);
        toast.error(message);
        return;
      }

      const message =
        "Reset link request accepted. Please check your email or ask your admin to review server logs in dev mode.";
      setSuccessMessage(message);
      toast.success("Reset link generated.");
    } catch {
      const message =
        "Network error while requesting password reset. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full flex items-center justify-center px-4 py-14 sm:py-20 bg-[#f5fced]">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-sm border border-[#e6eddf] p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d631b] tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#4a5a45]">
          Enter your account email and we will generate a secure, time-limited reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-[#2f3b2a]">Email Address</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-[#eaf1e3] px-4 py-3">
              <Mail className="h-4 w-4 text-[#6d7b66]" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent outline-none text-[#1f281b] placeholder:text-[#879581]"
                autoComplete="email"
                required
              />
            </div>
          </label>

          {errorMessage ? (
            <p className="text-sm font-semibold text-[#b93815]">{errorMessage}</p>
          ) : null}

          {successMessage ? (
            <p className="text-sm font-semibold text-[#0d631b]">{successMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#0d631b] hover:bg-[#095612] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {loading ? "Requesting Reset Link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-sm text-[#4a5a45] flex items-center gap-2">
          <span>Remember your password?</span>
          <Link className="font-semibold text-[#0d631b] hover:underline" href={backHref}>
            {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
