"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";

import { clientAuth, clientGoogleProvider } from "../../../lib/firebaseClient";

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
    setLoading(true);
    setError("");

    try {
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
    setLoading(true);
    setError("");

    try {
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
      <h1>Login Test</h1>
      <p>Use this page to sign in and test protected backend endpoints.</p>

      <form
        onSubmit={handleEmailLogin}
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name (optional)"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="Email"
          required
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Login with Email/Password"}
        </button>
      </form>

      <div style={{ marginTop: "0.75rem" }}>
        <button type="button" onClick={handleGoogleLogin} disabled={loading}>
          {loading ? "Processing..." : "Login with Google"}
        </button>
      </div>

      <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={handleGetMe}
          disabled={loading || !token}
        >
          GET /api/auth/me
        </button>
        <button
          type="button"
          onClick={handleGetProfile}
          disabled={loading || !token}
        >
          GET /api/profile
        </button>
      </div>

      <form
        onSubmit={handlePatchProfile}
        style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}
      >
        <h2 className="text-lg font-semibold text-red-600">PATCH /api/profile</h2>
        <input
          value={patchName}
          onChange={(event) => setPatchName(event.target.value)}
          placeholder="name"
        />
        <input
          value={patchPhone}
          onChange={(event) => setPatchPhone(event.target.value)}
          placeholder="phone"
        />
        <input
          value={patchAddress}
          onChange={(event) => setPatchAddress(event.target.value)}
          placeholder="address"
        />
        <button type="submit" disabled={loading || !token}>
          {loading ? "Processing..." : "Update Profile"}
        </button>
      </form>

      {error ? (
        <p style={{ color: "#b00020", marginTop: "1rem" }}>{error}</p>
      ) : null}

      <section style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
        <div>
          <strong>UID:</strong> {uid || "-"}
        </div>
        <div>
          <strong>ID Token:</strong>
          <textarea
            value={token}
            readOnly
            rows={5}
            style={{ width: "100%", marginTop: "0.25rem" }}
          />
        </div>
        <div>
          <strong>POST /api/auth/login:</strong>
          <pre>{JSON.stringify(loginResult, null, 2)}</pre>
        </div>
        <div>
          <strong>GET /api/auth/me:</strong>
          <pre>{JSON.stringify(meResult, null, 2)}</pre>
        </div>
        <div>
          <strong>GET/PATCH /api/profile:</strong>
          <pre>{JSON.stringify(profileResult, null, 2)}</pre>
        </div>

      </section>
    </main>
  );
}
