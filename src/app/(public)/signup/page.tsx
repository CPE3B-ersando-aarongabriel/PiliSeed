"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
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

async function callSignupEndpoint(
  token: string,
  name: string,
): Promise<EndpointResult> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(name ? { name } : {}),
  });

  return {
    status: response.status,
    body: await parseJsonSafe(response),
  };
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupResult, setSignupResult] = useState<EndpointResult | null>(null);

  async function completeSignup(user: User, fallbackName = "") {
    const idToken = await user.getIdToken();
    const response = await callSignupEndpoint(idToken, fallbackName);

    setToken(idToken);
    setUid(user.uid);
    setSignupResult(response);

    if (response.status >= 400) {
      throw new Error("Backend signup endpoint returned an error.");
    }
  }

  async function handleEmailSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credential = await createUserWithEmailAndPassword(
        clientAuth,
        email,
        password,
      );

      await completeSignup(credential.user, name.trim());
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Signup failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError("");

    try {
      const credential = await signInWithPopup(
        clientAuth,
        clientGoogleProvider,
      );

      await completeSignup(credential.user, credential.user.displayName ?? "");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Google signup failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Signup Test</h1>
      <p>Create an account in Firebase Auth and sync it to backend signup.</p>

      <form
        onSubmit={handleEmailSignup}
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
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
          minLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Signup with Email/Password"}
        </button>
      </form>

      <div style={{ marginTop: "0.75rem" }}>
        <button type="button" onClick={handleGoogleSignup} disabled={loading}>
          {loading ? "Processing..." : "Signup with Google"}
        </button>
      </div>

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
          <strong>POST /api/auth/signup:</strong>
          <pre>{JSON.stringify(signupResult, null, 2)}</pre>
        </div>
      </section>
    </main>
  );
}
