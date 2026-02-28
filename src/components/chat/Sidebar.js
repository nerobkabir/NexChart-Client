"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useStore } from "@/lib/store";
import { fmtSidebarDate, trunc } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import SearchModal from "./SearchModal";

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout }       = useAuth();
  const { onlineMap, on, off } = useSocket();
  const pathname               = usePathname();
  const router                 = useRouter();
  const { conversations, setConversations, upsertConversation, updateLastMessage } = useStore();

  const [loading, setLoading]   = useState(true);
  const [showSearch, setSearch] = useState(false);

  useEffect(() => {
    api.get("/conversations")
      .then((r) => setConversations(r.data.conversations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = ({ conversationId, lastMessage, unreadCount }) => {
      updateLastMessage(conversationId, lastMessage, unreadCount);
    };
    on("conv:updated", handler);
    return () => off("conv:updated", handler);
  }, [on, off]);

  const isOnline = (uid) => onlineMap[uid]?.isOnline ?? false;

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const navToConv = (id) => {
    router.push(`/chat/${id}`);
    onMobileClose?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full"
      style={{ background: "linear-gradient(180deg, #0D1422 0%, #0B1120 100%)" }}>

      {/* ── Header ──────────────────────────── */}
      <div className="px-4 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">

          {/* Avatar with gradient ring */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full z-0"
              style={{
                background: "linear-gradient(135deg, #7C6EFA, #00C9A7)",
                borderRadius: "50%",
                padding: "1.5px"
              }} />
            <div className="relative z-10" style={{ margin: "1.5px" }}>
              <Avatar src={user?.avatar} name={user?.name} size={9} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#00C9A7", borderColor: "#0D1422" }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight" style={{ color: "#EEF2FF" }}>
              {user?.name}
            </p>
            <p className="text-[11px] font-medium" style={{ color: "#00C9A7" }}>● Online</p>
          </div>

          <div className="flex items-center gap-1">
            {/* New chat button */}
            <button
              onClick={() => setSearch(true)}
              title="New chat"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
              style={{ background: "rgba(124,110,250,0.1)", border: "1px solid rgba(124,110,250,0.2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,110,250,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,110,250,0.1)"; }}
            >
              <svg className="w-4 h-4" style={{ color: "#7C6EFA" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,91,110,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,91,110,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              <svg className="w-4 h-4" style={{ color: "#5A6E8A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* App name */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: "#EEF2FF", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            NexChat
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(124,110,250,0.15)", color: "#7C6EFA", border: "1px solid rgba(124,110,250,0.25)" }}>
            BETA
          </span>
        </div>
      </div>

      {/* ── Section label ────────────────────── */}
      <div className="px-4 pt-5 pb-2 flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "#5A6E8A" }}>
          Messages
        </span>
      </div>

      {/* ── Conversation list ─────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-3/5" />
                <div className="skeleton h-2.5 w-2/5" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(124,110,250,0.08)", border: "1px solid rgba(124,110,250,0.15)" }}>
              <svg className="w-7 h-7" style={{ color: "#7C6EFA" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "#94A8CB" }}>No conversations yet</p>
            <p className="text-xs mb-4" style={{ color: "#5A6E8A" }}>Search for someone to start chatting</p>
            <button
              onClick={() => setSearch(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "rgba(124,110,250,0.15)", color: "#7C6EFA", border: "1px solid rgba(124,110,250,0.25)" }}
            >
              Start a chat
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const contact   = conv.contact;
            const active    = pathname === `/chat/${conv._id}`;
            const online    = isOnline(contact?._id) || contact?.isOnline;
            const preview   = conv.lastMessage?.isDeleted
              ? "🚫 Message deleted"
              : trunc(conv.lastMessage?.text || "No messages yet", 35);
            const hasUnread = conv.unreadCount > 0;

            return (
              <button
                key={conv._id}
                onClick={() => navToConv(conv._id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150"
                style={{
                  background: active
                    ? "linear-gradient(90deg, rgba(124,110,250,0.12) 0%, rgba(124,110,250,0.04) 100%)"
                    : "transparent",
                  borderLeft: active ? "2px solid #7C6EFA" : "2px solid transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar src={contact?.avatar} name={contact?.name} size={11} />
                  {online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                      style={{ background: "#00C9A7", borderColor: "#0D1422" }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm truncate"
                      style={{ color: "#EEF2FF", fontWeight: hasUnread ? 600 : 500 }}>
                      {contact?.name}
                    </span>
                    <span className="text-[10px] flex-shrink-0 ml-2 font-medium" style={{ color: "#5A6E8A" }}>
                      {conv.lastMessage && fmtSidebarDate(conv.lastMessage.createdAt || conv.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs truncate"
                      style={{ color: hasUnread ? "#94A8CB" : "#5A6E8A" }}>
                      {preview}
                    </span>
                    {hasUnread && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                        style={{ background: "#7C6EFA", color: "white" }}>
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ──────────────────── */}
      <aside
        className="hidden md:flex w-72 lg:w-80 flex-col h-full flex-shrink-0"
        style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer ────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 h-full w-[280px] z-10 animate-slideIn"
            style={{ boxShadow: "4px 0 30px rgba(0,0,0,0.5)" }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Search modal ─────────────────────── */}
      {showSearch && (
        <SearchModal
          onClose={() => setSearch(false)}
          onStart={(conv) => {
            upsertConversation(conv);
            setSearch(false);
            navToConv(conv._id);
          }}
        />
      )}
    </>
  );
}