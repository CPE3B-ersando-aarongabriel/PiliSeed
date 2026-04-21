"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JSX } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getClientAuth,
  getClientGoogleProvider,
  getMissingFirebaseClientEnvVars,
} from "@/lib/firebaseClient";

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

export const LoginSection = (): JSX.Element => {
  const router = useRouter();
  const missingFirebaseEnvVars = getMissingFirebaseClientEnvVars();
  const hasFirebaseConfig = missingFirebaseEnvVars.length === 0;
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function completeLogin(user: FirebaseUser, fallbackName = "") {
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

    if (loginResponse.status >= 400) {
      throw new Error("Backend login endpoint returned an error.");
    }

    toast.success("Login successful! Redirecting...");
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasFirebaseConfig) {
      toast.error(
        `Missing Firebase client env vars: ${missingFirebaseEnvVars.join(", ")}`,
      );
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const clientAuth = getClientAuth();
      const credential = await signInWithEmailAndPassword(
        clientAuth,
        email,
        password,
      );

      await completeLogin(credential.user);
    } catch (caughtError) {
      const firebaseCode =
        typeof caughtError === "object" && caughtError !== null && "code" in caughtError
          ? String((caughtError as { code: unknown }).code)
          : "";

      const message =
        firebaseCode === "auth/invalid-email"
          ? "Please enter a valid email address."
          : firebaseCode === "auth/user-not-found" ||
              firebaseCode === "auth/wrong-password" ||
              firebaseCode === "auth/invalid-credential"
            ? "No matching account found or password is incorrect."
            : firebaseCode === "auth/too-many-requests"
              ? "Too many login attempts. Please try again in a moment."
              : "Login failed. Please check your credentials and try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!hasFirebaseConfig) {
      toast.error(
        `Missing Firebase client env vars: ${missingFirebaseEnvVars.join(", ")}`,
      );
      return;
    }

    setLoading(true);

    try {
      const clientAuth = getClientAuth();
      const clientGoogleProvider = getClientGoogleProvider();
      const credential = await signInWithPopup(
        clientAuth,
        clientGoogleProvider,
      );

      await completeLogin(credential.user, credential.user.displayName ?? "");
    } catch (caughtError) {
      const firebaseCode =
        typeof caughtError === "object" && caughtError !== null && "code" in caughtError
          ? String((caughtError as { code: unknown }).code)
          : "";

      const message =
        firebaseCode === "auth/popup-closed-by-user"
          ? "Google login was cancelled."
          : firebaseCode === "auth/popup-blocked"
            ? "Popup was blocked by the browser. Please allow popups and try again."
            : "Google login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <section className="relative w-full pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20">
      <div className="relative w-full overflow-hidden bg-[#eff6e7] flex flex-col lg:flex-row lg:min-h-[860px]">
        <motion.div 
          className="hidden lg:flex absolute inset-y-0 left-0 w-1/2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-[url(/login/Login.png)] bg-cover bg-[50%_50%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,69,13,0.45)_0%,rgba(0,69,13,0.72)_100%)]" />

          <motion.div 
            className="absolute inset-x-10 top-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="[font-family:'Manrope-Bold',Helvetica] font-bold text-transparent text-7xl leading-[72px]">
              <span className="text-white tracking-[-1.30px]">
                Cultivate
                <br />
                your{" "}
              </span>
              <span className="text-[#a3f69c] tracking-[0]">
                digital
                <br />
              </span>
              <span className="text-white tracking-[-1.30px]">legacy.</span>
            </h1>
          </motion.div>

          <motion.p 
            className="absolute inset-x-10 bottom-20 [font-family:'Inter-Medium',Helvetica] font-medium text-[#ffffffcc] text-xl tracking-[0] leading-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join the ecosystem of precision agriculture
            <br />
            and sustainable growth monitoring. Your farm,
            <br />
            data-driven.
          </motion.p>
        </motion.div>

        <motion.div 
          className="relative lg:absolute lg:inset-y-0 lg:right-0 flex w-full lg:w-1/2 items-start justify-center px-4 sm:px-8 lg:px-16 pt-12 sm:pt-16 lg:pt-28 pb-10 sm:pb-12 lg:pb-0 bg-[#eff6e7] lg:bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="flex w-full max-w-md flex-col items-start gap-10"
          >
            <motion.header 
              className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto] bg-transparent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#171d14] text-4xl tracking-[-0.90px] leading-10">
                Welcome Back
              </div>
            </div>
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#41493e] text-base tracking-[0] leading-6">
                Please enter your credentials to access
                <br />
                your dashboard.
              </p>
            </div>
            </motion.header>

            <motion.div 
              className="flex flex-col self-stretch w-full gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col w-full items-end gap-2">
              <div className="flex flex-col w-full items-start relative flex-[0_0_auto]">
                <label
                  className="relative flex items-center w-[96.34px] h-5 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5 whitespace-nowrap"
                  htmlFor="input-1"
                >
                  Email Address
                </label>
              </div>
              <motion.div 
                className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                whileHover={{ scale: 1.02 }}
                whileFocus={{ scale: 1.02 }}
              >
                <div className="pl-12 pr-4 py-[18px] flex items-start justify-center relative self-stretch w-full flex-[0_0_auto] bg-[#e3ebdc] rounded-[32px] overflow-hidden transition-all hover:bg-[#d9e1d0]">
                  <input
                    className="autofill-white relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#000000] text-base tracking-[0] leading-[normal] p-0 outline-none"
                    id="input-1"
                    name="login-email"
                    placeholder="john@piliseed.com"
                    type="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="inline-flex flex-col h-[42.86%] items-start absolute top-[28.57%] left-4 text-[#8b9587]">
                  <Mail className="h-4 w-5" aria-hidden="true" />
                </div>
              </motion.div>
              </div>
              <div className="flex flex-col w-full items-end gap-2">
              <div className="flex flex-col w-full items-start relative flex-[0_0_auto]">
                <label
                  className="relative flex items-center w-[66.39px] h-5 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5 whitespace-nowrap"
                  htmlFor="input-2"
                >
                  Password
                </label>
              </div>
              <motion.div 
                className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="px-12 py-[18px] flex items-start justify-center relative self-stretch w-full flex-[0_0_auto] bg-[#e3ebdc] rounded-[32px] overflow-hidden transition-all hover:bg-[#d9e1d0]">
                  <input
                    className="autofill-white relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#000000] text-base tracking-[0] leading-[normal] p-0 outline-none"
                    id="input-2"
                    name="login-password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="inline-flex flex-col h-[42.86%] items-start absolute top-[28.57%] left-4 text-[#8b9587]">
                  <Lock className="h-[21px] w-4" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute h-[27.27%] top-[36.36%] right-4 inline-flex flex-col items-center justify-center bg-transparent border-none cursor-pointer p-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <div className="inline-flex items-start justify-center relative flex-[0_0_auto]">
                    {showPassword ? (
                      <EyeOff className="h-[15px] w-[22px] text-[#8b9587]" aria-hidden="true" />
                    ) : (
                      <Eye className="h-[15px] w-[22px] text-[#8b9587]" aria-hidden="true" />
                    )}
                  </div>
                </button>
              </motion.div>
            </div>

            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-0 py-4 relative self-stretch flex-[0_0_auto] bg-[linear-gradient(90deg,rgba(0,69,13,1)_0%,rgba(6,95,24,1)_100%)] w-full rounded-full cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              whileHover={{ scale: 1.03, boxShadow: "0px 12px 24px rgba(0, 69, 13, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute h-full top-0 left-0 bg-[#ffffff01] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] w-full rounded-full" />
              <div className="relative flex items-center justify-center w-[155.41px] h-7 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-lg text-center tracking-[0] leading-7 whitespace-nowrap">
                {loading ? "Processing..." : "Sign In to PiliSeed"}
              </div>
            </motion.button>

            <motion.div 
              className="relative self-stretch w-full flex-[0_0_auto]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex w-full h-full items-center justify-center relative">
                <div className="relative flex-1 grow h-px border-t [border-top-style:solid] border-[#c0c9bb4c]" />
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start justify-center relative self-stretch w-full flex-[0_0_auto]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              <div className="inline-flex flex-col items-start px-4 py-0 relative self-stretch flex-[0_0_auto] bg-[#eff6e7]">
                <div className="w-[116px] h-4 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#717a6d] text-xs tracking-[1.20px] leading-4 relative flex items-center mt-[-1.00px] whitespace-nowrap">
                  OR SIGN IN WITH
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 grid-rows-[50px] h-fit gap-4 self-stretch w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || !hasFirebaseConfig}
                className="all-[unset] box-border row-[1_/_2] col-[1_/_2] w-full h-fit min-h-[56px] inline-flex gap-2 px-8 py-3.5 rounded-[32px] border border-solid border-[#c0c9bb4c] items-center justify-center relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.05, borderColor: "#a3f69c" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <img
                    src="/signup/Google.svg"
                    alt="Google"
                    className="relative h-5 w-5"
                  />
                </div>
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <div className="justify-center min-w-[48.23px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#171d14] text-sm text-center tracking-[0] leading-5 relative flex items-center mt-[-1.00px] whitespace-nowrap">
                    {loading ? "Processing..." : "Google"}
                  </div>
                </div>
              </motion.button>
            </motion.div>

            <motion.div 
              className="flex items-start justify-center gap-1 pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.65 }}
            >
            <div className="relative flex items-center justify-center w-[183.08px] h-6 mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#41493e] text-base text-center tracking-[0] leading-6 whitespace-nowrap">
              New to the ecosystem?
            </div>
              <Link
                href="/signup"
                className="all-[unset] box-border relative flex items-center justify-center w-[88.03px] h-6 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#7a5649] text-base text-center tracking-[0] leading-6 whitespace-nowrap cursor-pointer transition-colors hover:text-[#a3f69c]"
              >
                Get Started
              </Link>
            </motion.div>
          </form>

        </motion.div>
      </div>
    </section>
  );
};