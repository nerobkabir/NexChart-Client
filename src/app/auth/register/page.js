"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register }       = useAuth();
  const router             = useRouter();
  const [form, setForm]    = useState({ name: "", email: "", password: "" });
  const [error, setError]  = useState("");
  const [loading, setLoading] = useState(false);

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

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink-3 border border-ink-5 shadow-glow mb-5">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-700 text-snow tracking-tight">Connect</h1>
          <p className="text-mist text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-ink-2 border border-ink-4 rounded-2xl p-8 shadow-panel">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            {[
              { key: "name",     label: "Full Name",  type: "text",     placeholder: "Alice Johnson" },
              { key: "email",    label: "Email",      type: "email",    placeholder: "alice@example.com" },
              { key: "password", label: "Password",   type: "password", placeholder: "Min. 6 characters" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-mist-2 mb-2">{label}</label>
                <input
                  className="input-field" type={type} placeholder={placeholder}
                  value={form[key]} onChange={set(key)} required
                />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-ink bg-primary hover:bg-primary-dark
                         disabled:opacity-50 transition-all duration-200 shadow-glow-sm mt-2"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-mist text-sm mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}