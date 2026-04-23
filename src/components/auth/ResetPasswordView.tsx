"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast } from "sonner";


function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !email) {
      setErrorMessage("Invalid or missing reset token. Please request a new link.");
      setSuccessMessage("");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      setSuccessMessage("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setSuccessMessage("");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        const message = body?.error?.message ?? "Unable to reset password right now.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      const message = "Password reset successful. You can now log in.";
      setSuccessMessage(message);
      toast.success(message);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      const message = "Network error while resetting password. Please try again.";
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
          Reset Password
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#4a5a45]">
          Create a new password for <span className="font-semibold">{email || "your account"}</span>.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-[#2f3b2a]">New Password</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-[#eaf1e3] px-4 py-3">
              <LockKeyhole className="h-4 w-4 text-[#6d7b66]" aria-hidden="true" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-transparent outline-none text-[#1f281b] placeholder:text-[#879581]"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="text-[#6d7b66]"
                onClick={() => setShowNewPassword((value) => !value)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#2f3b2a]">Confirm New Password</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-[#eaf1e3] px-4 py-3">
              <LockKeyhole className="h-4 w-4 text-[#6d7b66]" aria-hidden="true" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Retype your new password"
                className="w-full bg-transparent outline-none text-[#1f281b] placeholder:text-[#879581]"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="text-[#6d7b66]"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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
            className="w-full rounded-2xl bg-[#0d631b] hover:bg-[#095612] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 transition-colors"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-sm text-[#4a5a45] flex items-center gap-2">
          <span>Go back</span>
          <Link className="font-semibold text-[#0d631b] hover:underline" href="/login">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ResetPasswordView() {
  return (
    <Suspense 
      fallback={
        <section className="w-full flex items-center justify-center px-4 py-14 sm:py-20 bg-[#f5fced]">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-sm border border-[#e6eddf] p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
            <p className="text-[#0d631b] font-semibold animate-pulse">Loading...</p>
          </div>
        </section>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}