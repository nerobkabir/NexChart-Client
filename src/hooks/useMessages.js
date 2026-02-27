"use client";
import { useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { useStore } from "@/lib/store";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

export function useMessages(conversationId) {
  const { user }        = useAuth();
  const { on, off, joinConv, leaveConv, sendRead } = useSocket();
  const { messages, pagination, setMessages, prependMessages, pushMessage, markRead, setPagination } = useStore();

  const msgs     = messages[conversationId] || [];
  const page     = pagination[conversationId] || { hasMore: true, loading: false };
  const initDone = useRef(false);

  // ── Initial load ───────────────────────
  const load = useCallback(async () => {
    if (!conversationId) return;
    setPagination(conversationId, { loading: true });
    try {
      const r = await api.get(`/messages/${conversationId}?limit=20`);
      setMessages(conversationId, r.data.messages);
      setPagination(conversationId, {
        hasMore:   r.data.pagination.hasMore,
        oldestTs:  r.data.messages[0]?.createdAt || null,
        loading:   false,
      });
    } catch {
      setPagination(conversationId, { loading: false });
    }
  }, [conversationId]);

  // ── Load older (infinite scroll up) ───
  const loadOlder = useCallback(async () => {
    if (!page.hasMore || page.loading || !page.oldestTs) return;
    setPagination(conversationId, { loading: true });
    try {
      const r = await api.get(`/messages/${conversationId}?limit=20&before=${page.oldestTs}`);
      prependMessages(conversationId, r.data.messages);
      setPagination(conversationId, {
        hasMore:  r.data.pagination.hasMore,
        oldestTs: r.data.messages[0]?.createdAt || page.oldestTs,
        loading:  false,
      });
    } catch {
      setPagination(conversationId, { loading: false });
    }
  }, [conversationId, page]);

  // ── Socket events ──────────────────────
  useEffect(() => {
    if (!conversationId) return;
    if (!initDone.current) { load(); initDone.current = true; }

    joinConv(conversationId);
    sendRead(conversationId);

    const onNew = ({ message, conversationId: cid }) => {
      if (cid === conversationId) {
        pushMessage(conversationId, message);
        sendRead(conversationId);
      }
    };
    const onRead = ({ conversationId: cid, readBy }) => {
      if (cid === conversationId && readBy !== user?._id) {
        markRead(conversationId, readBy);
      }
    };

    on("msg:new", onNew);
    on("msg:read", onRead);

    return () => {
      off("msg:new", onNew);
      off("msg:read", onRead);
      leaveConv(conversationId);
      initDone.current = false;
    };
  }, [conversationId]);

  return { msgs, hasMore: page.hasMore, loadingOlder: page.loading, loadOlder };
}