"use client";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import Avatar from "@/components/ui/Avatar";

export default function SearchModal({ onClose, onStart }) {
  const [q, setQ]             = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(null);
  const inputRef = useRef(null);
  const timer    = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

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
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-scaleIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-ink-2 border border-ink-4 rounded-2xl w-full max-w-md shadow-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-4">
          <h2 className="font-semibold text-snow">New Message</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-mist hover:text-snow hover:bg-ink-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4 border-b border-ink-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email…"
              className="input-field pl-9"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {results.length === 0 && q.trim() && !loading ? (
            <p className="text-center text-mist text-sm py-8">No users found.</p>
          ) : results.length === 0 ? (
            <p className="text-center text-mist text-sm py-8">Type to search users…</p>
          ) : (
            results.map((u) => (
              <button key={u._id} onClick={() => start(u._id)}
                disabled={starting === u._id}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-ink-3 transition-colors disabled:opacity-50 text-left">
                <Avatar src={u.avatar} name={u.name} size={10} online={u.isOnline} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-snow truncate">{u.name}</p>
                  <p className="text-xs text-mist truncate">{u.email}</p>
                </div>
                {starting === u._id && (
                  <div className="ml-auto w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}