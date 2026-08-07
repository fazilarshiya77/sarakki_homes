"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password.");
        setLoading(false);
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0d0d0d] px-6 py-12">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[20%] h-[80%] w-[60%] rounded-full bg-accent-gold/5 blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] h-[80%] w-[60%] rounded-full bg-accent-gold/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-md rounded-lg border border-white/5 bg-black/40 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        {/* Header/Logo */}
        <div className="flex flex-col items-center text-center">
          <span className="font-display text-2xl tracking-[0.2em] uppercase text-accent-gold-dark font-medium">
            Sarakki Homes
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-2">
            Enterprise CRM Login
          </span>
          <p className="mt-4 text-xs text-muted-foreground/80 leading-relaxed max-w-[280px]">
            Please sign in using your staff credentials to access the console.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-sm border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/50">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-white/[0.02] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none transition-all duration-300 focus:border-accent-gold/40 focus:bg-white/[0.04]"
                  placeholder="name@sarakkihomes.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/50">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-white/[0.02] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none transition-all duration-300 focus:border-accent-gold/40 focus:bg-white/[0.04]"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded-sm border border-white/20 bg-transparent text-accent-gold focus:ring-0 outline-none accent-accent-gold"
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Please contact your IT administrator to reset your password.")}
              className="text-accent-gold-dark hover:text-accent-gold transition-colors font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-accent-gold-dark to-accent-gold/90 hover:from-accent-gold hover:to-accent-gold-dark py-3.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
