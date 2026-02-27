import { create } from "zustand";

export const useStore = create((set, get) => ({
  // ── Conversations ─────────────────────────
  conversations: [],
  setConversations: (conversations) => set({ conversations }),

  upsertConversation: (conv) =>
    set((s) => {
      const idx = s.conversations.findIndex((c) => c._id === conv._id);
      if (idx === -1) return { conversations: [conv, ...s.conversations] };
      const updated = [...s.conversations];
      updated[idx] = { ...updated[idx], ...conv };
      return { conversations: updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) };
    }),

  updateLastMessage: (conversationId, lastMessage, unreadCount) =>
    set((s) => ({
      conversations: s.conversations
        .map((c) => c._id === conversationId
          ? { ...c, lastMessage, unreadCount: unreadCount ?? c.unreadCount, updatedAt: new Date() }
          : c)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    })),

  clearUnread: (conversationId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  // ── Messages ──────────────────────────────
  messages: {},          // { [convId]: Message[] }
  pagination: {},        // { [convId]: { hasMore, loading, oldestTs } }

  setMessages: (convId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [convId]: msgs } })),

  prependMessages: (convId, older) =>
    set((s) => ({
      messages: { ...s.messages, [convId]: [...older, ...(s.messages[convId] || [])] },
    })),

  pushMessage: (convId, msg) =>
    set((s) => {
      const existing = s.messages[convId] || [];
      if (existing.find((m) => m._id === msg._id)) return s;
      return { messages: { ...s.messages, [convId]: [...existing, msg] } };
    }),

  markRead: (convId, readBy) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [convId]: (s.messages[convId] || []).map((m) =>
          m.readBy?.includes(readBy) ? m : { ...m, readBy: [...(m.readBy || []), readBy] }
        ),
      },
    })),

  setPagination: (convId, data) =>
    set((s) => ({
      pagination: { ...s.pagination, [convId]: { ...(s.pagination[convId] || {}), ...data } },
    })),
}));