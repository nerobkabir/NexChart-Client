"use client";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import Avatar from "@/components/ui/Avatar";

export default function SearchModal({ onClose, onStart }) {
  const [q, setQ]               = useState("");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [starting, setStarting] = useState(null);
  const inputRef = useRef(null);
  const timer    = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
        setResults(r.data.users);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
  }, [q]);

  const start = async (uid) => {
    setStarting(uid);
    try {
      const r = await api.post("/conversations", { recipientId: uid });
      onStart(r.data.conversation);
    } catch { setStarting(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden animate-scaleIn"
        style={{
          background: "rgba(13, 20, 34, 0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,110,250,0.1)"
        }}>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="font-bold text-text" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              New Message
            </h2>
            <p className="text-xs text-text-3 mt-0.5">Search for people to chat with</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,91,110,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
            <svg className="w-4 h-4 text-text-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {loading
                ? <div className="w-4 h-4 border-[1.5px] border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "rgba(124,110,250,0.3)", borderTopColor: "#7C6EFA" }} />
                : <svg className="w-4 h-4 text-text-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              }
            </div>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email…"
              className="input-field pl-10"
              style={{ borderRadius: "12px" }}
            />
            {q && (
              <button onClick={() => setQ("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
          {!q.trim() ? (
            <div className="flex flex-col items-center py-10 text-center px-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "rgba(124,110,250,0.08)", border: "1px solid rgba(124,110,250,0.15)" }}>
                <svg className="w-6 h-6" style={{ color: "#7C6EFA" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-text-2 text-sm font-medium">Find someone</p>
              <p className="text-text-3 text-xs mt-1">Type a name or email to search</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="flex flex-col items-center py-10 text-center px-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "rgba(255,91,110,0.06)", border: "1px solid rgba(255,91,110,0.12)" }}>
                <svg className="w-6 h-6" style={{ color: "#FF5B6E" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-text-2 text-sm font-medium">No results for "{q}"</p>
              <p className="text-text-3 text-xs mt-1">Try a different name or email</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((u, idx) => (
                <button key={u._id} onClick={() => start(u._id)}
                  disabled={starting === u._id}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all duration-150"
                  style={{ animationDelay: `${idx * 40}ms` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(124,110,250,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div className="relative flex-shrink-0">
                    <Avatar src={u.avatar} name={u.name} size={11} />
                    {u.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{ background: "#00C9A7", borderColor: "#0D1422" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{u.name}</p>
                    <p className="text-xs text-text-3 truncate mt-0.5">{u.email}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {starting === u._id ? (
                      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: "rgba(124,110,250,0.3)", borderTopColor: "#7C6EFA" }} />
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: "rgba(124,110,250,0.12)", color: "#7C6EFA", border: "1px solid rgba(124,110,250,0.2)" }}>
                        Chat
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom safe area for mobile */}
        <div className="h-safe-bottom sm:hidden" style={{ height: "env(safe-area-inset-bottom, 8px)" }} />
      </div>
    </div>
  );
}