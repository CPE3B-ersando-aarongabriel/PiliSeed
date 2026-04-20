"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { getClientAuth } from "@/lib/firebaseClient";

type AuthMode = "signup" | "login";

type TestAuthPanelProps = {
  mode: AuthMode;
};

type ApiResult = {
  status: number;
  body: unknown;
};

function stringifyPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return "Unable to serialize payload.";
  }
}

export function TestAuthPanel({ mode }: TestAuthPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idToken, setIdToken] = useState("");
  const [uid, setUid] = useState("");
  const [apiResult, setApiResult] = useState<ApiResult | null>(null);
  const [testApiResult, setTestApiResult] = useState<ApiResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingToken, setIsTestingToken] = useState(false);

  const title =
    mode === "signup" ? "Temporary Test Signup" : "Temporary Test Login";

  const actionLabel = mode === "signup" ? "Create Test User" : "Login Test User";

  const alternateLink = mode === "signup" ? "/test/login" : "/test/signup";
  const alternateLabel =
    mode === "signup"
      ? "Already have a test account? Go to test login"
      : "Need a test account? Go to test signup";

  const tokenPreview = useMemo(() => {
    if (!idToken) {
      return "";
    }

    return idToken.length > 220 ? `${idToken.slice(0, 220)}...` : idToken;
  }, [idToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setApiResult(null);
    setTestApiResult(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (mode === "signup" && password.trim().length < 6) {
      setErrorMessage("Password must be at least 6 characters for Firebase Auth.");
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getClientAuth();
      const authResult =
        mode === "signup"
          ? await createUserWithEmailAndPassword(auth, email.trim(), password)
          : await signInWithEmailAndPassword(auth, email.trim(), password);

      const nextToken = await authResult.user.getIdToken(true);
      setIdToken(nextToken);
      setUid(authResult.user.uid);

      const apiPath = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";

      const response = await fetch(apiPath, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nextToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
        }),
      });

      const responseBody: unknown = await response.json().catch(() => null);

      setApiResult({
        status: response.status,
        body: responseBody,
      });

      if (!response.ok) {
        setErrorMessage(
          `Auth API returned ${response.status}. Check response payload below.`,
        );
      }
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Authentication failed. Check Firebase Auth configuration.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyToken() {
    if (!idToken) {
      return;
    }

    await navigator.clipboard.writeText(idToken);
  }

  async function handleTestToken() {
    if (!idToken) {
      setErrorMessage("No ID token available yet. Login or signup first.");
      return;
    }

    setIsTestingToken(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/test", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const responseBody: unknown = await response.json().catch(() => null);

      setTestApiResult({
        status: response.status,
        body: responseBody,
      });

      if (!response.ok) {
        setErrorMessage(
          `Token test returned ${response.status}. Check response payload below.`,
        );
      }
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Failed to call /api/test.";

      setErrorMessage(message);
    } finally {
      setIsTestingToken(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-[#dbe8cc] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6a8b4a]">
            Temporary QA Utility
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#1d2f13]">{title}</h1>
          <p className="mt-2 text-sm text-[#3d4f2f]">
            This page is separate from your production login/signup UI and is only for fast token generation.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[#2f4122]">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-[#c6d8b3] px-3 py-2 outline-none transition focus:border-[#6a8b4a]"
                placeholder="test@example.com"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#2f4122]">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-[#c6d8b3] px-3 py-2 outline-none transition focus:border-[#6a8b4a]"
                placeholder="minimum 6 characters"
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-[#2f4122]">
            Display Name (optional)
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-[#c6d8b3] px-3 py-2 outline-none transition focus:border-[#6a8b4a]"
              placeholder="Farmer Test"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#44652a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#35501f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Processing..." : actionLabel}
            </button>

            <Link
              href={alternateLink}
              className="text-sm font-medium text-[#35501f] underline underline-offset-2"
            >
              {alternateLabel}
            </Link>
          </div>
        </form>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-[#f2c2c2] bg-[#fff3f3] px-3 py-2 text-sm text-[#9a2626]">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 space-y-3 rounded-xl border border-[#e4edd8] bg-[#f8fbf3] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToken}
              disabled={!idToken}
              className="rounded-lg border border-[#b8cf9f] bg-white px-3 py-1.5 text-xs font-semibold text-[#35501f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Copy ID Token
            </button>

            <button
              type="button"
              onClick={handleTestToken}
              disabled={!idToken || isTestingToken}
              className="rounded-lg border border-[#b8cf9f] bg-white px-3 py-1.5 text-xs font-semibold text-[#35501f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isTestingToken ? "Testing..." : "Test Token on /api/test"}
            </button>
          </div>

          <p className="text-xs text-[#465a36]">
            UID: {uid || "-"}
          </p>

          <div>
            <p className="text-xs font-semibold text-[#3f5130]">ID Token Preview</p>
            <textarea
              readOnly
              value={tokenPreview}
              className="mt-1 h-24 w-full rounded-lg border border-[#cfddbf] bg-white px-3 py-2 text-xs text-[#1f3112]"
            />
          </div>
        </div>

        {apiResult ? (
          <div className="mt-6">
            <p className="text-xs font-semibold text-[#3f5130]">
              /api/auth/{mode} response (status {apiResult.status})
            </p>
            <pre className="mt-2 overflow-auto rounded-lg border border-[#d7e3c8] bg-[#fbfdf8] p-3 text-xs text-[#203316]">
              {stringifyPayload(apiResult.body)}
            </pre>
          </div>
        ) : null}

        {testApiResult ? (
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#3f5130]">
              /api/test response (status {testApiResult.status})
            </p>
            <pre className="mt-2 overflow-auto rounded-lg border border-[#d7e3c8] bg-[#fbfdf8] p-3 text-xs text-[#203316]">
              {stringifyPayload(testApiResult.body)}
            </pre>
          </div>
        ) : null}
      </div>
    </section>
  );
}
