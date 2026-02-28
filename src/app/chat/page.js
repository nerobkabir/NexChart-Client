"use client";
import { useContext } from "react";
import { MobileMenuContext } from "./layout";

export default function ChatIndex() {
  const openMenu = useContext(MobileMenuContext);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none"
      style={{ background: "#0B1120" }}>

      {/* Mobile hamburger button — top left */}
      <button
        onClick={openMenu}
        className="md:hidden fixed top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center z-10"
        style={{ background: "rgba(124,110,250,0.15)", border: "1px solid rgba(124,110,250,0.3)" }}
      >
        <svg className="w-5 h-5" style={{ color: "#7C6EFA" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "rgba(124,110,250,0.08)", border: "1px solid rgba(124,110,250,0.15)" }}>
        <svg className="w-8 h-8" style={{ color: "#7C6EFA" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>

      {/* Text */}
      <h2 className="text-lg font-semibold mb-2" style={{ color: "#EEF2FF" }}>Your messages</h2>
      <p className="text-sm max-w-xs leading-relaxed mb-6" style={{ color: "#5A6E8A" }}>
        Select a conversation or press <span style={{ color: "#7C6EFA", fontWeight: 600 }}>+</span> to start a new one.
      </p>

      {/* Mobile only — Browse button */}
      <button
        onClick={openMenu}
        className="md:hidden px-5 py-2.5 rounded-xl text-sm font-semibold"
        style={{
          background: "linear-gradient(135deg, #7C6EFA 0%, #6459E8 100%)",
          color: "white",
          boxShadow: "0 4px 15px rgba(124,110,250,0.3)"
        }}
      >
        Browse Conversations
      </button>
    </div>
  );
}