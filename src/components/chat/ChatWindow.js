"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useStore } from "@/lib/store";
import { useMessages } from "@/hooks/useMessages";
import { useTyping } from "@/hooks/useTyping";
import { fmtTime, fmtLastSeen, fmtDateDivider, isSameDay } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

// ── Read receipt ticks ────────────────────────────────────────
const Ticks = ({ read }) => (
  <svg className="inline-block" width="16" height="10" viewBox="0 0 16 10" fill="none">
    <path d="M1 5l3 3L10 1" stroke={read ? "#00C9A7" : "#5A6E8A"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 5l3 3L14.5 1" stroke={read ? "#00C9A7" : "#5A6E8A"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ChatWindow({ conversationId, onMenuClick }) {
  const { user }               = useAuth();
  const { onlineMap, sendMsg } = useSocket();
  const { clearUnread }        = useStore();
  const nav                    = useRouter();

  const [conv, setConv]               = useState(null);
  const [input, setInput]             = useState("");
  const [sending, setSending]         = useState(false);
  const [convLoading, setConvLoading] = useState(true);

  const endRef       = useRef(null);
  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const prevHeight   = useRef(0);

  const { msgs, hasMore, loadingOlder, loadOlder } = useMessages(conversationId);
  const { typingLabel, onInput, onBlur }           = useTyping(conversationId);

  useEffect(() => {
    setConvLoading(true);
    api.get("/conversations")
      .then((r) => {
        const found = r.data.conversations?.find((c) => c._id === conversationId);
        if (found) { setConv(found); clearUnread(conversationId); }
        else nav.push("/chat");
      })
      .catch(() => nav.push("/chat"))
      .finally(() => setConvLoading(false));
  }, [conversationId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 180;
    const lastIsOwn  = (msgs.at(-1)?.sender?._id ?? msgs.at(-1)?.sender) === user?._id;
    if (nearBottom || lastIsOwn) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || !hasMore || loadingOlder) return;
    if (el.scrollTop < 80) {
      prevHeight.current = el.scrollHeight;
      loadOlder().then(() => {
        requestAnimationFrame(() => { el.scrollTop = el.scrollHeight - prevHeight.current; });
      });
    }
  }, [hasMore, loadingOlder, loadOlder]);

  useEffect(() => { inputRef.current?.focus(); }, [conversationId]);

  const doSend = useCallback(() => {
    const text = input.trim();
    if (!text || sending) return;
    setInput(""); setSending(true); onBlur();
    sendMsg(conversationId, text, (result) => {
      if (result?.error) setInput(text);
      setSending(false);
    });
  }, [input, sending, conversationId, sendMsg, onBlur]);

  const handleKey = (e) => {
    onInput();
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
  };

  if (convLoading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: "#0B1120" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(124,110,250,0.3)", borderTopColor: "#7C6EFA" }} />
        <p className="text-text-3 text-xs">Loading…</p>
      </div>
    </div>
  );

  const contact     = conv?.contact;
  const isOnline    = onlineMap[contact?._id]?.isOnline ?? contact?.isOnline;
  const lastSeenStr = onlineMap[contact?._id]?.lastSeen  || contact?.lastSeen;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#0B1120" }}>

      {/* ────────── Header ────────── */}
      <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{
          background: "rgba(13, 20, 34, 0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)"
        }}>

        {/* Mobile menu button */}
        <button onClick={onMenuClick}
          className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <svg className="w-4 h-4 text-text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Contact avatar */}
        <div className="relative flex-shrink-0">
          <Avatar src={contact?.avatar} name={contact?.name} size={10} />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#00C9A7", borderColor: "#0D1422" }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text leading-tight truncate">{contact?.name}</p>
          <div className="h-4 flex items-center">
            {typingLabel ? (
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#7C6EFA" }}>
                <span className="dot w-1 h-1" style={{ width: "5px", height: "5px" }} />
                <span className="dot w-1 h-1" style={{ width: "5px", height: "5px" }} />
                <span className="dot w-1 h-1" style={{ width: "5px", height: "5px" }} />
                <span className="ml-1">typing…</span>
              </span>
            ) : isOnline ? (
              <span className="text-[11px] font-semibold" style={{ color: "#00C9A7" }}>● Active now</span>
            ) : (
              <span className="text-[11px] text-text-3">{fmtLastSeen(lastSeenStr)}</span>
            )}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-text-3 hover:text-text-2"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-text-3 hover:text-text-2"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ────────── Messages area ────────── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4"
        style={{
          background: "linear-gradient(180deg, #0B1120 0%, #080C14 100%)",
          backgroundAttachment: "local"
        }}
      >
        {loadingOlder && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-text-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="w-3 h-3 border border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#5A6E8A", borderTopColor: "#7C6EFA" }} />
              Loading older messages
            </div>
          </div>
        )}

        {msgs.map((msg, i) => {
          const senderId = msg.sender?._id ?? msg.sender;
          const isOwn    = senderId === user?._id;
          const prev     = msgs[i - 1];
          const showDate = !prev || !isSameDay(prev.createdAt, msg.createdAt);
          const isRead   = (msg.readBy?.length ?? 0) > 0;
          const showAvatar = !isOwn && (!msgs[i + 1] || (msgs[i + 1]?.sender?._id ?? msgs[i + 1]?.sender) !== senderId);

          return (
            <div key={msg._id} className="mb-0.5">
              {showDate && (
                <div className="flex items-center gap-3 py-5 select-none">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "#5A6E8A"
                    }}>
                    {fmtDateDivider(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>
              )}

              <div className={`flex items-end gap-2 mb-1 msg-group ${isOwn ? "flex-row-reverse" : ""} animate-fadeUp`}>
                {/* Other person avatar */}
                <div className="w-8 flex-shrink-0">
                  {!isOwn && showAvatar && (
                    <Avatar src={contact?.avatar} name={contact?.name} size={8} />
                  )}
                </div>

                <div className={`flex flex-col max-w-[70%] sm:max-w-sm ${isOwn ? "items-end" : "items-start"}`}>
                  {/* Bubble */}
                  <div className={`px-4 py-2.5 text-sm leading-relaxed break-words
                    ${msg.isDeleted ? "opacity-50 italic" : ""}
                  `}
                    style={isOwn ? {
                      background: "linear-gradient(135deg, #7C6EFA 0%, #6459E8 100%)",
                      color: "white",
                      borderRadius: "18px 18px 4px 18px",
                      boxShadow: "0 2px 12px rgba(124,110,250,0.25)"
                    } : {
                      background: "rgba(20, 31, 51, 0.9)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#D4DCEE",
                      borderRadius: "18px 18px 18px 4px"
                    }}>
                    {msg.isDeleted
                      ? <span className="text-xs">🚫 This message was deleted</span>
                      : msg.text}
                  </div>

                  {/* Meta */}
                  <div className={`flex items-center gap-1.5 mt-1 px-1 msg-time ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] font-medium" style={{ color: "#3D5068" }}>
                      {fmtTime(msg.createdAt)}
                    </span>
                    {isOwn && !msg.isDeleted && <Ticks read={isRead} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing bubble */}
        {typingLabel && (
          <div className="flex items-end gap-2 mt-2 animate-fadeUp">
            <div className="w-8 flex-shrink-0">
              <Avatar src={contact?.avatar} name={contact?.name} size={8} />
            </div>
            <div className="px-4 py-3 flex items-center gap-1.5"
              style={{
                background: "rgba(20, 31, 51, 0.9)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "18px 18px 18px 4px"
              }}>
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* ────────── Input bar ────────── */}
      <div className="px-3 sm:px-4 py-3 flex-shrink-0"
        style={{
          background: "rgba(13, 20, 34, 0.95)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)"
        }}>
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <button className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors mb-0.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg className="w-4 h-4 text-text-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              onBlur={onBlur}
              placeholder="Type a message…"
              rows={1}
              className="w-full text-sm resize-none outline-none leading-relaxed"
              style={{
                background: "rgba(20, 31, 51, 0.8)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "11px 16px",
                color: "#EEF2FF",
                fontFamily: "'Manrope', sans-serif",
                minHeight: "44px",
                maxHeight: "120px",
                transition: "border-color 0.2s, box-shadow 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(124,110,250,0.4)";
                e.target.style.boxShadow = "0 0 0 3px rgba(124,110,250,0.08)";
              }}
              onBlur2={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                e.target.style.boxShadow = "none";
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={doSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-150 mb-0.5"
            style={{
              background: (!input.trim() || sending)
                ? "rgba(124,110,250,0.2)"
                : "linear-gradient(135deg, #7C6EFA 0%, #6459E8 100%)",
              boxShadow: (!input.trim() || sending) ? "none" : "0 4px 15px rgba(124,110,250,0.35)",
              cursor: (!input.trim() || sending) ? "not-allowed" : "pointer"
            }}>
            {sending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <svg className="w-4 h-4 text-white translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            }
          </button>
        </div>
      </div>
    </div>
  );
}