"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useStore } from "@/lib/store";
import { fmtSidebarDate, trunc } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import SearchModal from "./SearchModal";

export default function Sidebar() {
  const { user, logout }      = useAuth();
  const { onlineMap, on, off } = useSocket();
  const params                = useParams();
  const router                = useRouter();
  const { conversations, setConversations, upsertConversation, updateLastMessage } = useStore();

  const [loading, setLoading]   = useState(true);
  const [showSearch, setSearch] = useState(false);

  // Load conversations
  useEffect(() => {
    api.get("/conversations")
      .then((r) => setConversations(r.data.conversations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Real-time: update sidebar when a new message arrives in any conversation
  useEffect(() => {
    const handler = ({ conversationId, lastMessage, unreadCount }) => {
      updateLastMessage(conversationId, lastMessage, unreadCount);
    };
    on("conv:updated", handler);
    return () => off("conv:updated", handler);
  }, [on, off]);

  const isOnline = (userId) => onlineMap[userId]?.isOnline ?? false;

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <>
      <aside className="w-72 lg:w-80 bg-ink-2 border-r border-ink-4 flex flex-col h-full flex-shrink-0">

        {/* ── Header ──────────────────────────── */}
        <div className="px-4 py-4 border-b border-ink-4 flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.name} size={9} online />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-snow truncate">{user?.name}</p>
            <p className="text-xs text-primary">● Online</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setSearch(true)}
              title="New chat"
              className="p-2 rounded-xl text-mist hover:text-snow hover:bg-ink-4 transition-colors">
              <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-mist hover:text-red-400 hover:bg-ink-4 transition-colors">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Label ───────────────────────────── */}
        <div className="px-4 pt-4 pb-1">
          <span className="text-[11px] font-semibold text-mist uppercase tracking-widest">Messages</span>
        </div>

        {/* ── List ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // Skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-2/3" />
                  <div className="skeleton h-2.5 w-1/2" />
                </div>
              </div>
            ))
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-mist text-sm">No conversations yet.</p>
              <button onClick={() => setSearch(true)}
                className="mt-2 text-primary text-sm hover:underline">
                Start chatting →
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const contact  = conv.contact;
              const active   = params?.id === conv._id;
              const online   = isOnline(contact?._id) || conv.contact?.isOnline;
              const preview  = conv.lastMessage?.isDeleted
                ? "🚫 Message deleted"
                : trunc(conv.lastMessage?.text || "No messages yet");

              return (
                <Link key={conv._id} href={`/chat/${conv._id}`}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-ink-4/50 transition-colors
                             hover:bg-ink-3 group
                             ${active ? "bg-ink-3 border-l-2 border-l-primary" : ""}`}>
                  <Avatar src={contact?.avatar} name={contact?.name} size={10} online={online} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-snow truncate">{contact?.name}</span>
                      <span className="text-[11px] text-mist flex-shrink-0 ml-2">
                        {conv.lastMessage && fmtSidebarDate(conv.lastMessage.createdAt || conv.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-mist truncate">{preview}</span>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-ink
                                         text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      {showSearch && (
        <SearchModal
          onClose={() => setSearch(false)}
          onStart={(conv) => {
            upsertConversation(conv);
            setSearch(false);
            router.push(`/chat/${conv._id}`);
          }}
        />
      )}
    </>
  );
}