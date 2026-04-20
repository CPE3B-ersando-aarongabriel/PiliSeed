"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JSX } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sprout, User } from "lucide-react";
import {
  createUserWithEmailAndPassword,
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

export const SignupSection = (): JSX.Element => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const missingFirebaseEnvVars = getMissingFirebaseClientEnvVars();
  const hasFirebaseConfig = missingFirebaseEnvVars.length === 0;
  const [loading, setLoading] = useState(false);

  async function completeSignup(user: FirebaseUser) {
    const idToken = await user.getIdToken();
    const response = await callSignupEndpoint(idToken, fullName.trim());

    if (response.status >= 400) {
      throw new Error("Backend signup endpoint returned an error.");
    }

    toast.success("Account created! Redirecting to login...");
    setTimeout(() => router.push("/login"), 1500);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasFirebaseConfig) {
      toast.error(
        `Missing Firebase client env vars: ${missingFirebaseEnvVars.join(", ")}`,
      );
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const clientAuth = getClientAuth();
      const credential = await createUserWithEmailAndPassword(
        clientAuth,
        email,
        password,
      );

      await completeSignup(credential.user);
    } catch (caughtError) {
      const firebaseCode =
        typeof caughtError === "object" && caughtError !== null && "code" in caughtError
          ? String((caughtError as { code: unknown }).code)
          : "";

      const message =
        firebaseCode === "auth/email-already-in-use"
          ? "That email is already registered. Please log in instead."
          : firebaseCode === "auth/invalid-email"
            ? "Please enter a valid email address."
            : firebaseCode === "auth/weak-password"
              ? "Password is too weak. Use at least 8 characters."
              : "Signup failed. Please check your details and try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
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

      await completeSignup(credential.user);
    } catch (caughtError) {
      const firebaseCode =
        typeof caughtError === "object" && caughtError !== null && "code" in caughtError
          ? String((caughtError as { code: unknown }).code)
          : "";

      const message =
        firebaseCode === "auth/popup-closed-by-user"
          ? "Google sign-up was cancelled."
          : firebaseCode === "auth/popup-blocked"
            ? "Popup was blocked by the browser. Please allow popups and try again."
            : "Google signup failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mt-12 sm:mt-16 lg:mt-20 w-full min-h-[720px] lg:min-h-[860px] overflow-hidden mb-12 sm:mb-16 lg:mb-20 bg-[#f5fced]">
      <motion.div 
        className="hidden lg:flex absolute top-0 left-0 h-full w-1/2 overflow-hidden bg-[url(/signup/Signup.png)] bg-cover bg-[50%_50%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute w-full h-[calc(100%_+_13px)] top-0 left-0 bg-[linear-gradient(0deg,rgba(0,69,13,0.6)_0%,rgba(0,69,13,0)_100%)]" />
        <motion.div 
          className="flex flex-col w-[calc(100%_-_96px)] items-start gap-4 absolute left-12 bottom-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative flex items-center gap-3 self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-white text-5xl tracking-[-2.40px] leading-[48px]">
              <img
                src="/Pili-logo-main.png"
                alt="PiliSeed logo"
                className="w-12 h-12 object-contain"
              />
              PiliSeed
            </div>
          </div>
          <div className="flex flex-col max-w-md w-[448px] items-start relative flex-[0_0_auto] opacity-90">
            <p className="relative w-[437.16px] h-[65px] mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-white text-xl tracking-[0] leading-[32.5px]">
              Nurture your agricultural legacy with precision
              <br />
              data and organic growth management.
            </p>
          </div>
        </motion.div>
        <motion.div 
          className="inline-flex items-center gap-3 px-6 py-3 absolute top-12 left-12 bg-[#f5fcedb2] rounded-full backdrop-blur-md backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(12px)_brightness(100%)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
            <Sprout className="relative h-[16.99px] w-[17px] text-[#00450d]" aria-hidden="true" />
          </div>
          <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
            <div className="[font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-xs tracking-[1.2px] leading-5 uppercase relative flex items-center mt-[-1.00px] whitespace-nowrap">
              AI FARM INTELLIGENCE PLATFORM
            </div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div 
        className="relative lg:absolute top-0 left-0 lg:left-1/2 w-full lg:w-1/2 min-h-[720px] lg:min-h-full bg-[#f5fced] flex flex-col items-center pt-12 sm:pt-16 lg:pt-0 pb-10 sm:pb-12 lg:pb-0 lg:justify-center px-4 sm:px-8 lg:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#fdcdbc33] rounded-full blur-[32px]" />
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col max-w-md w-full lg:w-[calc(100%_-_192px)] items-start gap-12 pt-0 pb-4 px-0 relative lg:ml-24 lg:mr-16"
        >
          <motion.div 
            className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <h1 className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#00450d] text-4xl tracking-[-0.90px] leading-10">
                Create your ecosystem
              </h1>
            </div>
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-base tracking-[0] leading-6">
                Start your journey into high-precision, natural farming.
              </p>
            </div>
          </motion.div>
          <motion.div 
            className="flex flex-col items-start gap-10 relative self-stretch w-full flex-[0_0_auto]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col w-full items-start gap-6 relative flex-[0_0_auto]">
              <div className="flex flex-col items-end gap-2 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col w-full items-start relative flex-[0_0_auto]">
                  <label
                    htmlFor="full-name"
                    className="w-[66.75px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5 relative flex items-center mt-[-1.00px] whitespace-nowrap"
                  >
                    Full Name
                  </label>
                </div>
                <motion.div 
                  className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center pl-12 pr-4 py-[18px] relative self-stretch w-full flex-[0_0_auto] bg-[#e3ebdc] rounded-[32px] overflow-hidden transition-all hover:bg-[#d9e1d0]">
                    <input
                      id="full-name"
                      name="signup-full-name"
                      type="text"
                      autoComplete="off"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Johnathan Appleseed"
                      className="autofill-white relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#c0c9bb] text-base tracking-[0] leading-[normal] p-0 outline-none placeholder:text-[#c0c9bb]"
                    />
                  </div>
                  <div className="inline-flex flex-col h-[42.86%] items-start absolute top-[28.57%] left-4">
                    <User className="relative h-4 w-4 text-[#8b9587]" aria-hidden="true" />
                  </div>
                </motion.div>
              </div>
              <div className="flex flex-col items-end gap-2 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col w-full items-start relative flex-[0_0_auto]">
                  <label
                    className="w-[96.34px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5 relative flex items-center mt-[-1.00px] whitespace-nowrap"
                    htmlFor="input-1"
                  >
                    Email Address
                  </label>
                </div>
                <motion.div 
                  className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center pl-12 pr-4 py-[18px] relative self-stretch w-full flex-[0_0_auto] bg-[#e3ebdc] rounded-[32px] overflow-hidden">
                    <input
                      className="autofill-white relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#c0c9bb] text-base tracking-[0] leading-[normal] p-0 outline-none placeholder:text-[#c0c9bb]"
                      id="input-1"
                      name="signup-email"
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
                  <div className="inline-flex flex-col h-[42.86%] items-start absolute top-[28.57%] left-4">
                    <Mail className="relative h-4 w-5 text-[#8b9587]" aria-hidden="true" />
                  </div>
                </motion.div>
              </div>
              <div className="flex flex-col items-end gap-2 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col w-full items-start relative flex-[0_0_auto]">
                  <label
                    htmlFor="password"
                    className="w-[66.39px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5 relative flex items-center mt-[-1.00px] whitespace-nowrap"
                  >
                    Password
                  </label>
                </div>
                <motion.div 
                  className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center pl-12 pr-12 py-[18px] relative self-stretch w-full flex-[0_0_auto] bg-[#e3ebdc] rounded-[32px] overflow-hidden transition-all hover:bg-[#d9e1d0]">
                    <input
                      id="password"
                      name="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="autofill-white relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#c0c9bb] text-base tracking-[0] leading-[normal] p-0 outline-none placeholder:text-[#c0c9bb]"
                    />
                  </div>
                  <div className="inline-flex flex-col h-[42.86%] items-start absolute top-[28.57%] left-4">
                    <Lock className="relative h-[21px] w-4 text-[#8b9587]" aria-hidden="true" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="inline-flex flex-col items-center justify-center absolute h-[27.27%] top-[36.36%] right-4 bg-transparent border-none cursor-pointer p-0"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <div className="inline-flex items-start justify-center relative flex-[0_0_auto]">
                      {showPassword ? (
                        <EyeOff className="relative h-[15px] w-[22px] text-[#8b9587]" aria-hidden="true" />
                      ) : (
                        <Eye className="relative h-[15px] w-[22px] text-[#8b9587]" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                </motion.div>
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="all-[unset] box-border flex gap-[12.01px] px-0 py-5 self-stretch w-full flex-[0_0_auto] rounded-[48px] shadow-[0px_12px_30px_#00450d33] bg-[linear-gradient(90deg,rgba(0,69,13,1)_0%,rgba(6,95,24,1)_100%)] items-center justify-center relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              whileHover={{ scale: 1.03, boxShadow: "0px 12px 24px rgba(0, 69, 13, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                <div className="justify-center w-[151.09px] h-6 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-6 relative flex items-center mt-[-1.00px] whitespace-nowrap">
                  {loading ? "Processing..." : "Join the Ecosystem"}
                </div>
              </div>
              <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                <ArrowRight className="relative h-[12.74px] w-[12.75px] text-white" aria-hidden="true" />
              </div>
            </motion.button>
            <motion.div 
              className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="flex w-full h-[calc(100%_+_32px)] items-center justify-center absolute -top-4 left-0">
                <div className="relative flex-1 grow h-px border-t [border-top-style:solid] border-[#c0c9bb33]" />
              </div>
              <div className="flex items-start justify-center relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex flex-col items-start px-4 py-0 relative self-stretch flex-[0_0_auto] bg-[#f5fced]">
                  <div className="w-[122.36px] h-4 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#717a6d] text-xs tracking-[1.20px] leading-4 relative flex items-center mt-[-1.00px] whitespace-nowrap">
                    OR SIGN UP WITH
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="grid grid-cols-1 grid-rows-[50px] h-fit gap-4 self-stretch w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.65 }}
            >
              <motion.button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading || !hasFirebaseConfig}
                className="all-[unset] box-border row-[1_/_2] col-[1_/_2] w-full h-fit inline-flex gap-2 pl-[68.88px] pr-[68.89px] py-3.5 rounded-[32px] border border-solid border-[#c0c9bb4c] items-center justify-center relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  <div className="justify-center w-[48.23px] h-5 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#171d14] text-sm text-center tracking-[0] leading-5 relative flex items-center mt-[-1.00px] whitespace-nowrap">
                    {loading ? "Processing..." : "Google"}
                  </div>
                </div>
              </motion.button>
            </motion.div>
            <motion.div 
              className="flex items-start justify-center gap-1 pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="justify-center w-[174.88px] h-5 [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-sm text-center tracking-[0] leading-5 relative flex items-center mt-[-1.00px] whitespace-nowrap">
                Already have an account?
              </div>
              <a
                href="/login"
                className="items-center justify-center w-[37.44px] h-5 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#00450d] text-sm text-center tracking-[0] leading-5 underline whitespace-nowrap relative flex transition-colors hover:text-[#a3f69c]"
              >
                Login
              </a>
            </motion.div>
          </motion.div>
        </form>

      </motion.div>
    </div>
  );
};