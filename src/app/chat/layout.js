"use client";
import { createContext, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/chat/Sidebar";

// Mobile menu context — ChatWindow এ back button কাজ করবে
export const MobileMenuContext = createContext(() => {});

export default function ChatLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading]);

  useEffect(() => {
    setMobileOpen(false);
  }, [params?.id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: "#060912" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,110,250,0.2) 0%, rgba(0,201,167,0.1) 100%)",
            border: "1px solid rgba(124,110,250,0.3)"
          }}>
          <svg className="w-5 h-5" viewBox="0 0 28 28" fill="none">
            <path d="M14 2C7.373 2 2 6.925 2 13c0 2.152.67 4.15 1.82 5.82L2 24l5.82-1.04A12.04 12.04 0 0014 24c6.627 0 12-4.925 12-11S20.627 2 14 2z"
              fill="url(#grad-load)" />
            <defs>
              <linearGradient id="grad-load" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C6EFA" /><stop offset="1" stopColor="#00C9A7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "rgba(124,110,250,0.3)", borderTopColor: "#7C6EFA" }} />
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#060912" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <MobileMenuContext.Provider value={() => setMobileOpen(true)}>
          {children}
        </MobileMenuContext.Provider>
      </main>
    </div>
  );
}