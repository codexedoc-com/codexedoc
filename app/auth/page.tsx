"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Mail,
  User,
  ArrowLeft,
  ArrowRight,
  Lock,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Brain,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const turnstileEnabled = Boolean(turnstileSiteKey);
  const [turnstileStatus, setTurnstileStatus] = useState<"loading" | "ready" | "error">(
    turnstileEnabled ? "loading" : "ready"
  );

  useEffect(() => {
    if (authenticated) {
      router.push("/app");
    }
  }, [authenticated, router]);

  useEffect(() => {
    if (!turnstileEnabled || turnstileStatus !== "loading") {
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      setTurnstileStatus("ready");
    }, 4000);

    return () => window.clearTimeout(fallbackTimer);
  }, [turnstileEnabled, turnstileStatus]);

  async function handleSendCode(formData: FormData) {
    setMessage(null);

    if (turnstileEnabled && !turnstileToken && turnstileStatus !== "ready") {
      setTurnstileStatus("error");
      setMessage({ type: "error", text: "Please complete the verification challenge before requesting a code." });
      return;
    }

    startTransition(async () => {
      try {
        if (turnstileToken) {
          formData.set("cf-turnstile-response", turnstileToken);
        }

        await sendVerificationCode(formData);

        setEmail(formData.get("email")?.toString() ?? "");
        if (mode === "register") {
          setUsername(formData.get("username")?.toString() ?? "");
        }

        setStep("code");
        setMessage({
          type: "success",
          text: "Verification code sent. If testing locally without email, check your server console.",
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

        if (result?.success) {
          setMessage({
            type: "success",
            text: result.message || "Authentication successful!",
          });

          setTimeout(() => {
            setAuthenticated(true);
          }, 600);
        } else {
          setMessage({
            type: "error",
            text: "Invalid response from server",
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
    <main className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Navbar Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 transition hover:opacity-80">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">CODEXEDOC</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-zinc-200/80 rounded-2xl">
          {/* Mode Switcher */}
          {step === "email" && (
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl mb-6 text-sm font-medium text-zinc-600">
              <button
                type="button"
                onClick={() => { setMode("register"); setMessage(null); }}
                className={`py-2 rounded-lg transition text-center ${
                  mode === "register" ? "bg-white text-zinc-900 shadow-xs font-semibold" : "hover:text-zinc-900"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(null); }}
                className={`py-2 rounded-lg transition text-center ${
                  mode === "login" ? "bg-white text-zinc-900 shadow-xs font-semibold" : "hover:text-zinc-900"
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              {step === "email"
                ? mode === "register"
                  ? "Start your learning journey"
                  : "Welcome back"
                : "Verify your email"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {step === "email"
                ? mode === "register"
                  ? "Build mastery with science-backed spaced repetition."
                  : "Enter your email to continue your daily reviews."
                : `We sent a 6-digit verification code to ${email}`}
            </p>
          </div>

          {/* Form Step: Email */}
          {step === "email" ? (
            <form key="emailForm" action={handleSendCode} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Your Name / Username
                  </label>
                  <div className="relative rounded-xl border border-zinc-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      name="username"
                      type="text"
                      autoComplete="name"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Jane Doe"
                      className="block w-full rounded-xl py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-xl border border-zinc-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="block w-full rounded-xl py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>
              </div>

              <input type="hidden" name="mode" value={mode} />

              {/* Turnstile Widget (Conditional) */}
              {turnstileEnabled && (
                <div className="pt-2 flex justify-center">
                  <Turnstile
                    siteKey={turnstileSiteKey!}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setTurnstileStatus("ready");
                    }}
                    onExpire={() => {
                      setTurnstileToken("");
                      setTurnstileStatus("loading");
                    }}
                    onError={() => {
                      setTurnstileToken("");
                      setTurnstileStatus("error");
                    }}
                    options={{ appearance: "always", theme: "light" }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={pending || !email.trim() || (mode === "register" && !username.trim())}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                {pending ? "Sending code..." : "Send Verification Code"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* Form Step: Code Verification */
            <form key="codeForm" action={handleVerifyCode} className="space-y-4">
              <input type="hidden" name="email" value={email} />
              {mode === "register" && <input type="hidden" name="username" value={username} />}

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative rounded-xl border border-zinc-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    autoFocus
                    placeholder="123456"
                    className="block w-full rounded-xl py-2.5 pl-10 pr-3 text-lg font-mono tracking-widest text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                {pending ? "Verifying..." : "Verify & Continue"}
                <CheckCircle2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-center text-xs font-medium text-zinc-500 hover:text-zinc-900 transition pt-1 cursor-pointer"
              >
                ← Back to email
              </button>
            </form>
          )}

          {/* Feedback Message */}
          {message && (
            <div
              className={`mt-4 rounded-xl p-3 text-xs leading-relaxed ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                  : "bg-rose-50 text-rose-800 border border-rose-200/60"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Value Prop Footer */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-zinc-500">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/60 border border-zinc-200/40">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span>Active Recall</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/60 border border-zinc-200/40">
            <Brain className="h-4 w-4 text-indigo-600" />
            <span>SM-2 Spaced SRS</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/60 border border-zinc-200/40">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <span>Skill Blueprint</span>
          </div>
        </div>
      </div>
    </main>
  );
}