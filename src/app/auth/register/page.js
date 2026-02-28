"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const fields = [
  { key: "name",     label: "Full Name",  type: "text",     placeholder: "Alice Johnson",       icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { key: "email",    label: "Email",      type: "email",    placeholder: "alice@example.com",   icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "password", label: "Password",   type: "password", placeholder: "Min. 6 characters",  icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
];

export default function RegisterPage() {
  const { register }          = useAuth();
  const router                = useRouter();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep]       = useState(0); // for staggered field focus effect

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally { setLoading(false); }
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "#FF5B6E", "#F59E0B", "#00C9A7"][strength];

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Ambient ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(124,110,250,0.09) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(0,201,167,0.07) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#7C6EFA 1px, transparent 1px), linear-gradient(90deg, #7C6EFA 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-scaleIn">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(0,201,167,0.2) 0%, rgba(124,110,250,0.15) 100%)",
              border: "1px solid rgba(0,201,167,0.25)",
              boxShadow: "0 0 30px rgba(0,201,167,0.15)"
            }}>
            <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
              <path d="M14 2C7.373 2 2 6.925 2 13c0 2.152.67 4.15 1.82 5.82L2 24l5.82-1.04A12.04 12.04 0 0014 24c6.627 0 12-4.925 12-11S20.627 2 14 2z"
                fill="url(#grad2)" />
              <circle cx="9" cy="13" r="1.5" fill="white" opacity="0.9" />
              <circle cx="14" cy="13" r="1.5" fill="white" opacity="0.9" />
              <circle cx="19" cy="13" r="1.5" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="grad2" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00C9A7" />
                  <stop offset="1" stopColor="#7C6EFA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Create Account
          </h1>
          <p className="text-text-3 text-sm mt-1 font-medium">Join NexChat today — it's free</p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(16, 24, 40, 0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset"
          }}>

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
            {fields.map(({ key, label, type, placeholder, icon }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">{label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-text-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                    </svg>
                  </span>
                  <input
                    className="input-field pl-10"
                    type={key === "password" && showPass ? "text" : type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    required
                    style={{ paddingRight: key === "password" ? "48px" : undefined }}
                  />
                  {key === "password" && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors">
                      {showPass
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  )}
                </div>

                {/* Password strength bar */}
                {key === "password" && form.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1,2,3].map((i) => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: strength >= i ? strengthColor : "#1E2D45" }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 mt-2"
              style={{
                background: loading ? "rgba(0,201,167,0.4)" : "linear-gradient(135deg, #00C9A7 0%, #7C6EFA 100%)",
                color: "white",
                boxShadow: loading ? "none" : "0 4px 20px rgba(0,201,167,0.25), 0 1px 0 rgba(255,255,255,0.1) inset"
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : "Create Account →"}
            </button>
          </form>
        </div>

        <p className="text-center text-text-3 text-sm mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold" style={{ color: "#7C6EFA" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}