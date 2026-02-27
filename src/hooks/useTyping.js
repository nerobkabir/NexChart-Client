"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";

export function useTyping(conversationId) {
  const { on, off, sendTypingOn, sendTypingOff } = useSocket();
  const [typers, setTypers] = useState({});
  const timerRef   = useRef(null);
  const isTyping   = useRef(false);

  // ── Listen for remote typing ───────────
  useEffect(() => {
    if (!conversationId) return;
    const handler = ({ conversationId: cid, userId, userName, isTyping: typing }) => {
      if (cid !== conversationId) return;
      setTypers((p) => {
        if (typing) return { ...p, [userId]: userName };
        const n = { ...p }; delete n[userId]; return n;
      });
    };
    on("typing", handler);
    return () => { off("typing", handler); setTypers({}); };
  }, [conversationId, on, off]);

  // ── Emit typing:on (debounced stop) ───
  const onInput = useCallback(() => {
    if (!isTyping.current) { isTyping.current = true; sendTypingOn(conversationId); }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isTyping.current = false;
      sendTypingOff(conversationId);
    }, 2500);
  }, [conversationId, sendTypingOn, sendTypingOff]);

  const onBlur = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isTyping.current) { isTyping.current = false; sendTypingOff(conversationId); }
  }, [conversationId, sendTypingOff]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const names = Object.values(typers);
  const label = names.length === 0 ? null
    : names.length === 1 ? `${names[0]} is typing`
    : `${names.slice(0, 2).join(", ")} are typing`;

  return { typingLabel: label, onInput, onBlur };
}