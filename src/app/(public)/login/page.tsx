"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";

import {
  getClientAuth,
  getClientGoogleProvider,
  getMissingFirebaseClientEnvVars,
} from "../../../lib/firebaseClient";

type EndpointResult = {
  status: number;
  body: unknown;
};

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return { message: "No JSON response body." };
  }
}

async function callProtectedEndpoint(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<EndpointResult> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  return {
    status: response.status,
    body: await parseJsonSafe(response),
  };
}

export default function LoginPage() {
  const missingFirebaseEnvVars = getMissingFirebaseClientEnvVars();
  const hasFirebaseConfig = missingFirebaseEnvVars.length === 0;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginResult, setLoginResult] = useState<EndpointResult | null>(null);
  const [meResult, setMeResult] = useState<EndpointResult | null>(null);
  const [profileResult, setProfileResult] = useState<EndpointResult | null>(
    null,
  );
  const [patchName, setPatchName] = useState("");
  const [patchPhone, setPatchPhone] = useState("");
  const [patchAddress, setPatchAddress] = useState("");

  async function completeLogin(user: User, fallbackName = "") {
    const idToken = await user.getIdToken();
    const loginPayload = fallbackName ? { name: fallbackName } : {};

    const loginResponse = await callProtectedEndpoint(
      "/api/auth/login",
      idToken,
      {
        method: "POST",
        body: JSON.stringify(loginPayload),
      },
    );

    setToken(idToken);
    setUid(user.uid);
    setLoginResult(loginResponse);

    if (loginResponse.status >= 400) {
      throw new Error("Backend login endpoint returned an error.");
    }
  }

  async function handleEmailLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase client env vars: ${missingFirebaseEnvVars.join(", ")}`,
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const clientAuth = getClientAuth();
      const credential = await signInWithEmailAndPassword(
        clientAuth,
        email,
        password,
      );

      await completeLogin(credential.user, name.trim());
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase client env vars: ${missingFirebaseEnvVars.join(", ")}`,
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const clientAuth = getClientAuth();
      const clientGoogleProvider = getClientGoogleProvider();
      const credential = await signInWithPopup(
        clientAuth,
        clientGoogleProvider,
      );

      await completeLogin(credential.user, credential.user.displayName ?? "");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Google login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetMe() {
    if (!token) {
      setError("Login first to get an ID token.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await callProtectedEndpoint("/api/auth/me", token);
      setMeResult(response);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetProfile() {
    if (!token) {
      setError("Login first to get an ID token.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await callProtectedEndpoint("/api/profile", token);
      setProfileResult(response);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePatchProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Login first to get an ID token.");
      return;
    }

    const payload: Record<string, string> = {};

    if (patchName.trim()) {
      payload.name = patchName.trim();
    }

    if (patchPhone.trim()) {
      payload.phone = patchPhone.trim();
    }

    if (patchAddress.trim()) {
      payload.address = patchAddress.trim();
    }

    if (!Object.keys(payload).length) {
      setError("Provide at least one field for PATCH /api/profile.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await callProtectedEndpoint("/api/profile", token, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setProfileResult(response);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "2rem auto", padding: "0 1rem" }}>
      <div>
          <h1 className="text-[#00450D] font-bold text-3xl">PiliSeed</h1>  
      </div>

      <div>
        <div className="font-semibold text-5xl">
          Welcome Back
        </div>

        <div className="text-[#41493E]">
          Please enter your credentials to access your dashboard
        </div>

      </div>

      
      {!hasFirebaseConfig ? (
        <p style={{ color: "#b00020" }}>
          Firebase client env configuration is incomplete. Add the missing values
          in .env.local and restart dev server: {missingFirebaseEnvVars.join(", ")}
        </p>
      ) : null}

      <form
        onSubmit={handleEmailLogin}
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <div className="flex flex-col gap-1 text-[#41493E] font-semibold">
          Email Address
          
          <div className="px-9 py-2 bg-[#E3EBDC] rounded-4xl relative w-full">
            <img src="/mail.png" alt="mail icon" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-4"/>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="john@piliseed.com"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[#41493E] font-semibold">
          Password
          <div className="px-9 py-2 bg-[#E3EBDC] rounded-4xl relative w-full">
            <img src="/lock.png" alt="lock icon" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-5"/>
            <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="••••••••"
            required
          />
          </div>

        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Login with Email/Password"}
        </button>
      </form>

      <div style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || !hasFirebaseConfig}
        >
          {loading ? "Processing..." : "Login with Google"}
        </button>
      </div>

    </main>
  );
}
