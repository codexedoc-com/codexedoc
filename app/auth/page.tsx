"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Mail,
  User,
  ArrowLeft,
  ArrowRight,
  Lock,
} from "lucide-react";
import Image from "next/image";

import { sendVerificationCode } from "@/server/actions/auth/sendVerificationCode";
import { verifyCode } from "@/server/actions/auth/verifyCode";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [step, setStep] = useState<"email" | "code">("email");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (authenticated) {
      router.push("/app");
    }
  }, [authenticated, router]);

  async function handleSendCode(formData: FormData) {
    setMessage(null);

    if (!turnstileToken) {
      setMessage({ type: "error", text: "Please complete the verification" });
      return;
    }

    startTransition(async () => {
      try {

        formData.set("cf-turnstile-response", turnstileToken);
        await sendVerificationCode(formData);

        setEmail(formData.get("email")?.toString() ?? "");
        if (mode === "register") {
          setUsername(formData.get("username")?.toString() ?? "");
        }

        setStep("code");
        setMessage({
          type: "success",
          text: "Verification code sent to your email.",
        });
        setTurnstileToken("");
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to send code",
        });
      }
    });
  }

  async function handleVerifyCode(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await verifyCode(formData);

        // Success case - use the message from the server
        if (result?.success) {
          setMessage({
            type: "success",
            text: result.message, // "Account created successfully!" or "Logged in successfully!"
          });

          // Small delay so user can see the success message
          setTimeout(() => {
            setAuthenticated(true);
          }, 800);
        } else {
          setMessage({
            type: "error",
            text: "Unexpected response from server",
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Verification failed",
        });
      }
    });
}

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* Background Effects (MATCH HOMEPAGE) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%)]" />
      <div className="absolute left-1/2 top-0 h-150 w-150 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-70px_70px]" />

      {/* Center Layout */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">

        {/* MAIN AUTH CARD */}
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(99,102,241,0.15)] lg:grid-cols-2">

        {/* LEFT PANEL (Context / Branding) */}
        <div className="relative hidden lg:flex flex-col justify-between items-center p-14 border-r border-white/10">

          {/* background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.15),transparent_60%)]" />

          <div className="relative z-10 py-20">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <Image src="/codexedoc.png" alt="Logo" className="h-8 w-8" width={24} height={24} />
              </div>
              <h1 className="text-2xl font-black">CODEXEDOC</h1>
            </div>

            <h1 className="mt-8 text-6xl font-black leading-tight">
              {mode === "login" ? (
                <>
                  Welcome<br />
                  <span className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Back.
                  </span>
                </>
              ) : (
                <>
                  Create<br />
                  <span className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Account.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-6 text-lg text-white/60 max-w-md leading-relaxed">
              {mode === "login"
                ? "Jump back into your learning journey. Continue where you left off and keep building mastery."
                : "Start your learning system. Build structured knowledge, track progress, and turn goals into mastery."}
            </p>

          </div>

        </div>

        {/* RIGHT PANEL (FORM) */}
        <div className="flex items-center justify-center p-10 sm:p-14">

          <div className="w-full max-w-md">

            {/* MOBILE HEADER */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <Image src="/codexedoc.png" alt="Logo" className="h-8 w-8" width={24} height={24} />
              </div>
              <h1 className="text-xl font-black">CODEXEDOC</h1>
            </div>

            {/* TITLE */}
            <div className="mb-8 lg:hidden">
              <h2 className="text-4xl font-black tracking-tight">
                {step === "email"
                  ? mode === "register"
                    ? "Create Account"
                    : "Sign In"
                  : "Verify Access"}
              </h2>

              <p className="mt-3 text-white/60">
                {step === "email"
                  ? mode === "login"
                    ? "Continue your learning journey"
                    : "Start building your learning system"
                  : "Enter the 6-digit code sent to your email"}
              </p>
            </div>

            {/* MODE TOGGLE */}
            {step === "email" && (
              <div className="mb-8 flex rounded-2xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-indigo-500 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
                    mode === "register"
                      ? "bg-indigo-500 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Register
                </button>
              </div>
            )}



            {/* EMAIL STEP */}
            {step === "email" ? (
              <form key="emailForm" action={handleSendCode} autoComplete="off" className="space-y-5">

                <input
                  type="text"
                  name="contact_field"
                  defaultValue=""
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                  }}
                />

                {mode === "register" && (
                  <div>
                    <label className="mb-2 block text-sm text-white/50">
                      Username
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl focus-within:border-indigo-500/30 transition">
                      <User className="h-5 w-5 text-indigo-300/60" />
                      <input
                        name="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your name"
                        className="w-full bg-transparent outline-none text-white/90"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-white/50">
                    Email
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl focus-within:border-indigo-500/30 transition">
                    <Mail className="h-5 w-5 text-indigo-300/60" />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent outline-none text-white/90"
                      required
                    />
                  </div>
                </div>

                <input type="hidden" name="mode" value={mode} />

                <div className="flex justify-center py-2">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => setTurnstileToken("")}
                    options={{ 
                      appearance: "always",
                      theme: "dark"
                    }}
                  />
                </div>

                <button
                  disabled={pending || !turnstileToken}
                  className="group w-full rounded-2xl bg-indigo-500 py-4 font-semibold transition hover:bg-indigo-400 disabled:opacity-50"
                >
                  {pending ? "Sending..." : "Send Verification Code"}
                  <ArrowRight className="ml-2 inline-block h-4 w-4 transition group-hover:translate-x-1" />
                </button>
              </form>
            ) : (
              /* CODE STEP */
              <form key="codeForm" action={handleVerifyCode} autoComplete="off" className="space-y-5">

                <input type="hidden" name="email" value={email} />
                {mode === "register" && (
                  <input type="hidden" name="username" value={username} />
                )}

                <div>
                  <label className="mb-2 block text-sm text-white/50">
                    Verification Code
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl focus-within:border-indigo-500/30 transition">
                    <Lock className="h-5 w-5 text-indigo-300/60" />
                    <input
                      type="text"
                      name="verificationCode"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      className="w-full bg-transparent text-2xl tracking-widest outline-none text-white/90"
                      required
                    />
                  </div>
                </div>

                <button
                  disabled={pending}
                  className="w-full rounded-2xl bg-indigo-500 py-4 font-semibold transition hover:bg-indigo-400 disabled:opacity-50"
                >
                  {pending ? "Verifying..." : "Verify & Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="flex w-full items-center justify-center gap-2 text-white/50 hover:text-white transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              </form>
            )}

            {/* MESSAGE (SYSTEM STYLE) */}
            {message && (
              <div
                className={`mt-8 rounded-2xl border p-4 text-sm backdrop-blur-xl ${
                  message.type === "success"
                    ? "border-green-500/20 bg-green-500/10 text-green-200"
                    : "border-red-500/20 bg-red-500/10 text-red-200"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}