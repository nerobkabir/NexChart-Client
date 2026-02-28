"use client";
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/chat/Sidebar";

export const MobileMenuContext = createContext(() => {});

export default function ChatLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: "#060912" }}>
      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "rgba(124,110,250,0.3)", borderTopColor: "#7C6EFA" }} />
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