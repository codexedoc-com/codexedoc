"use client";

import { useState, useTransition } from "react";
import { Mail, User, Code2, ArrowRight, ArrowLeft } from "lucide-react";

import { sendVerificationCode, verifyCode } from "@/server/actions/auth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [step, setStep] = useState<"email" | "code">("email");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  async function handleSendCode(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await sendVerificationCode(formData);
        
        setEmail(formData.get("email") as string);
        if (mode === "register") {
          setUsername(formData.get("username") as string);
        }
        
        setStep("code");
        setMessage({ 
          type: "success", 
          text: "Verification code sent! Please check your email." 
        });
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
        setMessage({ 
          type: "success", 
          text: "Successfully verified! Welcome to CODEXEDOC 🎉" 
        });
        // TODO: Redirect to dashboard later
        console.log("User verified:", result);
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_40%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl lg:grid-cols-2">

          {/* Left Panel */}
          <div className="hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 p-12 lg:flex">
            {/* Your existing left content here */}
          </div>

          {/* Right Panel */}
          <div className="flex items-center justify-center p-8 sm:p-12">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20">
                  <Code2 className="h-6 w-6 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-black">CODEXEDOC</h1>
              </div>

              <h2 className="text-4xl font-black tracking-tight mb-2">
                {step === "email"
                  ? mode === "register"
                    ? "Create Account"
                    : "Welcome Back"
                  : "Enter Verification Code"}
              </h2>

              <p className="mb-8 text-white/60">
                {step === "email"
                  ? mode === "register"
                    ? "Start your learning journey"
                    : "Sign in with your email"
                  : "We've sent a 6-digit code to your email"}
              </p>

              {/* Login / Register Tabs */}
              {step === "email" && (
                <div className="mb-8 flex rounded-2xl border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
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
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      mode === "register"
                        ? "bg-indigo-500 text-white"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Email Step */}
              {step === "email" ? (
                <form action={handleSendCode} className="space-y-5">
                  {mode === "register" && (
                    <div>
                      <label className="mb-2 block text-sm text-white/70">Username</label>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                        <User className="h-5 w-5 text-white/40" />
                        <input
                          type="text"
                          name="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Choose a username"
                          required
                          className="w-full bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm text-white/70">Email Address</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <Mail className="h-5 w-5 text-white/40" />
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  <input type="hidden" name="mode" value={mode} />

                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-2xl bg-indigo-500 py-4 font-semibold hover:bg-indigo-400 disabled:opacity-50"
                  >
                    {pending ? "Sending Code..." : "Send Verification Code"}
                  </button>
                </form>
              ) : (
                /* Code Verification Step */
                <form action={handleVerifyCode} className="space-y-5">
                  <input type="hidden" name="email" value={email} />
                  {mode === "register" && <input type="hidden" name="username" value={username} />}

                  <div>
                    <label className="mb-2 block text-sm text-white/70">6-Digit Code</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <Code2 className="h-5 w-5 text-white/40" />
                      <input
                        type="text"
                        name="code"
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="123456"
                        required
                        className="w-full bg-transparent outline-none text-2xl tracking-widest"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-2xl bg-indigo-500 py-4 font-semibold hover:bg-indigo-400 disabled:opacity-50"
                  >
                    {pending ? "Verifying..." : "Verify Code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Email
                  </button>
                </form>
              )}

              {message && (
                <div className={`mt-6 rounded-2xl p-4 text-sm border ${
                  message.type === "success" 
                    ? "bg-green-500/10 border-green-500/30 text-green-200" 
                    : "bg-red-500/10 border-red-500/30 text-red-200"
                }`}>
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