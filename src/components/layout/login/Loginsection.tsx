"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JSX } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
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
  const [error, setError] = useState("");

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

    if (loginResponse.status >= 400) {
      throw new Error("Backend login endpoint returned an error.");
    }

    toast.success("Login successful! Redirecting...");
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

      await completeLogin(credential.user);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Login failed.";
      setError(message);
      toast.error(message);
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
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <section className="relative w-full pt-20 pb-20">
      <div className="relative w-full overflow-hidden bg-[#eff6e7] flex flex-col lg:flex-row lg:h-[860px]">
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
          className="absolute inset-y-0 right-0 flex w-full lg:w-1/2 items-start justify-center px-4 sm:px-16 pt-20 lg:pt-28 bg-[#eff6e7] lg:bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <form
            onSubmit={handleSubmit}
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
              className="relative self-stretch w-full h-[190px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col w-full items-end gap-2 absolute top-0 left-0">
              <div className="flex flex-col w-[444px] items-start relative flex-[0_0_auto]">
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
                    className="relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#c0c9bb] text-base tracking-[0] leading-[normal] p-0 outline-none"
                    id="input-1"
                    placeholder="john@piliseed.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="inline-flex flex-col h-[42.86%] items-start absolute top-[28.57%] left-4 text-[#8b9587]">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M2 2H18V14H2V2Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 3L10 9L18 3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
              </motion.div>
              </div>
              <div className="flex flex-col w-full items-end gap-2 absolute top-[107px] left-0">
              <div className="flex flex-col w-[444px] items-start relative flex-[0_0_auto]">
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
                    className="relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#c0c9bb] text-base tracking-[0] leading-[normal] p-0 outline-none"
                    id="input-2"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="inline-flex flex-col h-[42.86%] items-start absolute top-[28.57%] left-4 text-[#8b9587]">
                  <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="2" y="9" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5 9V6.5C5 4.84 6.34 3.5 8 3.5C9.66 3.5 11 4.84 11 6.5V9" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute h-[27.27%] top-[36.36%] right-4 inline-flex flex-col items-center justify-center bg-transparent border-none cursor-pointer p-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <div className="inline-flex items-start justify-center relative flex-[0_0_auto]">
                    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8b9587]" aria-hidden="true">
                      <path d="M1 7.5C2.8 4.2 6.3 2 11 2C15.7 2 19.2 4.2 21 7.5C19.2 10.8 15.7 13 11 13C6.3 13 2.8 10.8 1 7.5Z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="11" cy="7.5" r="2.5" fill="currentColor"/>
                    </svg>
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
              className="grid grid-cols-2 grid-rows-[50px] h-fit gap-4 self-stretch w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || !hasFirebaseConfig}
                className="all-[unset] box-border row-[1_/_2] col-[1_/_2] w-full h-fit inline-flex gap-2 pl-[68.88px] pr-[68.89px] py-3.5 rounded-[32px] border border-solid border-[#c0c9bb4c] items-center justify-center relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.05, borderColor: "#a3f69c" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <img
                    className="relative w-5 h-5"
                    alt="Google"
                    src="/signup/Google.svg"
                  />
                </div>
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <div className="justify-center w-[48.23px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#171d14] text-sm text-center tracking-[0] leading-5 relative flex items-center mt-[-1.00px] whitespace-nowrap">
                    {loading ? "Processing..." : "Google"}
                  </div>
                </div>
              </motion.button>

              <motion.button
                type="button"
                className="all-[unset] box-border row-[1_/_2] col-[2_/_3] w-full h-fit inline-flex gap-[7.99px] px-[71.19px] py-3 rounded-[32px] border border-solid border-[#c0c9bb4c] items-center justify-center relative cursor-pointer transition-all"
                whileHover={{ scale: 1.05, borderColor: "#a3f69c" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <img className="relative w-4 h-2.5" alt="Apple" src="/signup/Apple.svg" />
                </div>
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <div className="justify-center w-[39.61px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#171d14] text-sm text-center tracking-[0] leading-5 relative flex items-center mt-[-1.00px] whitespace-nowrap">
                    Apple
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

          {error ? (
            <motion.p 
              style={{ color: "#b00020", marginTop: "1rem" }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};