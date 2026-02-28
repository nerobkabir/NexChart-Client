"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login }             = useAuth();
  const router                = useRouter();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
    } finally { setLoading(false); }
  };

  const fill = (email) => setForm({ email, password: "password123" });

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,110,250,0.12) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,201,167,0.08) 0%, transparent 70%)" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#7C6EFA 1px, transparent 1px), linear-gradient(90deg, #7C6EFA 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-scaleIn">

        {/* ── Logo ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative"
            style={{
              background: "linear-gradient(135deg, rgba(124,110,250,0.2) 0%, rgba(0,201,167,0.1) 100%)",
              border: "1px solid rgba(124,110,250,0.3)",
              boxShadow: "0 0 30px rgba(124,110,250,0.2)"
            }}>
            {/* Chat bubble icon */}
            <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
              <path d="M14 2C7.373 2 2 6.925 2 13c0 2.152.67 4.15 1.82 5.82L2 24l5.82-1.04A12.04 12.04 0 0014 24c6.627 0 12-4.925 12-11S20.627 2 14 2z"
                fill="url(#grad1)" />
              <circle cx="9" cy="13" r="1.5" fill="white" opacity="0.9" />
              <circle cx="14" cy="13" r="1.5" fill="white" opacity="0.9" />
              <circle cx="19" cy="13" r="1.5" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="grad1" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7C6EFA" />
                  <stop offset="1" stopColor="#00C9A7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            NexChat
          </h1>
          <p className="text-text-3 text-sm mt-1 font-medium">Sign in to your account</p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(16, 24, 40, 0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset"
          }}>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(255,91,110,0.08)", border: "1px solid rgba(255,91,110,0.2)", color: "#FF8A96" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Email</label>
              <input
                className="input-field"
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  className="input-field pr-12"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 relative overflow-hidden mt-2"
              style={{
                background: loading ? "rgba(124,110,250,0.5)" : "linear-gradient(135deg, #7C6EFA 0%, #6459E8 100%)",
                color: "white",
                boxShadow: loading ? "none" : "0 4px 20px rgba(124,110,250,0.35), 0 1px 0 rgba(255,255,255,0.1) inset"
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs text-text-3 font-medium">Quick Access</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Test accounts */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Alice", email: "alice@connect.app", color: "#7C6EFA" },
              { name: "Bob",   email: "bob@connect.app",   color: "#00C9A7" },
            ].map(({ name, email, color }) => (
              <button key={name} onClick={() => fill(email)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = color + "40"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: color + "20", color }}>
                  {name[0]}
                </span>
                <div>
                  <p className="text-text font-medium text-xs leading-none mb-0.5">{name}</p>
                  <p className="text-text-3 text-[10px]">Test account</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-text-3 text-sm mt-5">
          New here?{" "}
          <Link href="/auth/register"
            className="font-semibold transition-colors"
            style={{ color: "#7C6EFA" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#9D93FB"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#7C6EFA"}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}