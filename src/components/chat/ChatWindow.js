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

// ── Double tick read receipt icon ─────────────────────────────
const Tick = ({ read }) => (
  <svg className={`w-4 h-4 inline-block ${read ? "text-primary" : "text-mist"}`}
    viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 7l4.5 4.5L13 3" />
    <path d="M7 7l4.5 4.5L19 3" />
  </svg>
);

export default function ChatWindow({ conversationId }) {
  const { user }                      = useAuth();
  const { onlineMap, sendMsg }        = useSocket();
  const { clearUnread }               = useStore();
  const nav                           = useRouter();

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

  // ── Load conversation metadata (participants for header) ──────
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

  // ── Auto-scroll to bottom ─────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    const lastIsOwn  = (msgs.at(-1)?.sender?._id ?? msgs.at(-1)?.sender) === user?._id;
    if (nearBottom || lastIsOwn) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // ── Infinite scroll upward (load older messages) ──────────────
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

  // ── Focus input on conversation change ────────────────────────
  useEffect(() => { inputRef.current?.focus(); }, [conversationId]);

  // ── Send message via Socket.io ────────────────────────────────
  const doSend = useCallback(() => {
    const text = input.trim();
    if (!text || sending) return;
    setInput(""); setSending(true); onBlur();
    sendMsg(conversationId, text, (result) => {
      if (result?.error) setInput(text);   // restore on failure
      setSending(false);
    });
  }, [input, sending, conversationId, sendMsg, onBlur]);

  const handleKey = (e) => {
    onInput();   // trigger typing indicator
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
  };

  // ── Loading state ─────────────────────────────────────────────
  if (convLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const contact     = conv?.contact;
  const isOnline    = onlineMap[contact?._id]?.isOnline ?? contact?.isOnline;
  const lastSeenStr = onlineMap[contact?._id]?.lastSeen  || contact?.lastSeen;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ────────── Header ────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-ink-2 border-b border-ink-4 flex-shrink-0">
        <Avatar src={contact?.avatar} name={contact?.name} size={10} online={isOnline} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-snow leading-tight">{contact?.name}</p>
          <p className="text-xs h-4 flex items-center">
            {typingLabel ? (
              <span className="flex items-center gap-1.5 text-primary">
                <span className="dot" /><span className="dot" /><span className="dot" />
                <span>typing…</span>
              </span>
            ) : isOnline ? (
              <span className="text-primary">Online</span>
            ) : (
              <span className="text-mist">{fmtLastSeen(lastSeenStr)}</span>
            )}
          </p>
        </div>
      </div>

      {/* ────────── Messages ────────── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ background: "radial-gradient(ellipse at top, #111820 0%, #0A0F14 70%)" }}
      >
        {/* Infinite scroll loader */}
        {loadingOlder && (
          <div className="flex justify-center py-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {msgs.map((msg, i) => {
          const senderId = msg.sender?._id ?? msg.sender;
          const isOwn    = senderId === user?._id;
          const prev     = msgs[i - 1];
          const showDate = !prev || !isSameDay(prev.createdAt, msg.createdAt);
          const isRead   = (msg.readBy?.length ?? 0) > 0;

          return (
            <div key={msg._id} className="mb-1">
              {/* Date divider */}
              {showDate && (
                <div className="flex items-center gap-3 py-4 select-none">
                  <div className="flex-1 h-px bg-ink-4" />
                  <span className="text-[11px] text-mist bg-ink-3 px-3 py-1 rounded-full border border-ink-4">
                    {fmtDateDivider(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-ink-4" />
                </div>
              )}

              {/* Message row */}
              <div className={`flex items-end gap-2 msg-group ${isOwn ? "flex-row-reverse" : ""} animate-fadeUp`}>
                {!isOwn && (
                  <Avatar
                    src={contact?.avatar} name={contact?.name}
                    size={7} className="mb-0.5 flex-shrink-0"
                  />
                )}

                <div className={`flex flex-col max-w-xs lg:max-w-sm xl:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
                  {/* Bubble */}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                    ${isOwn
                      ? "bg-primary text-ink rounded-br-sm shadow-glow-sm"
                      : "bg-ink-3 text-snow border border-ink-4 rounded-bl-sm"
                    }
                    ${msg.isDeleted ? "opacity-60 italic" : ""}
                  `}>
                    {msg.isDeleted
                      ? <span className="text-xs opacity-70">🚫 This message was deleted</span>
                      : msg.text}
                  </div>

                  {/* Time + read receipt */}
                  <div className={`flex items-center gap-1 mt-0.5 px-1 msg-time ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] text-mist">{fmtTime(msg.createdAt)}</span>
                    {isOwn && !msg.isDeleted && <Tick read={isRead} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {typingLabel && (
          <div className="flex items-end gap-2 mt-1 animate-fadeUp">
            <Avatar src={contact?.avatar} name={contact?.name} size={7} className="mb-0.5" />
            <div className="bg-ink-3 border border-ink-4 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* ────────── Input ────────── */}
      <div className="px-4 py-3 bg-ink-2 border-t border-ink-4 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onBlur={onBlur}
            placeholder="Message…"
            rows={1}
            className="flex-1 bg-ink-3 border border-ink-5 rounded-2xl px-4 py-3 text-sm text-snow
                       placeholder-mist resize-none outline-none transition-all max-h-32 leading-relaxed
                       focus:border-primary focus:ring-2 focus:ring-primary/15"
            style={{ minHeight: "44px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
            }}
          />
          <button
            onClick={doSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 flex-shrink-0 rounded-2xl bg-primary hover:bg-primary-dark text-ink
                       flex items-center justify-center transition-all duration-150
                       disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-sm"
          >
            {sending
              ? <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              : <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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