"use client";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const Ctx = createContext(null);

export function SocketProvider({ children }) {
  const { user, token }        = useAuth();
  const socketRef              = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineMap, setOnlineMap] = useState({});   // { userId: { isOnline, lastSeen } }

  useEffect(() => {
    if (!user) { disconnectSocket(); setConnected(false); return; }

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("presence", ({ userId, isOnline, lastSeen }) => {
      setOnlineMap((p) => ({ ...p, [userId]: { isOnline, lastSeen } }));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("presence");
    };
  }, [user, token]);

  const emit = useCallback((ev, data, cb) => socketRef.current?.emit(ev, data, cb), []);
  const on   = useCallback((ev, fn) => socketRef.current?.on(ev, fn),  []);
  const off  = useCallback((ev, fn) => socketRef.current?.off(ev, fn), []);

  const joinConv  = useCallback((id) => emit("conv:join",  { conversationId: id }), [emit]);
  const leaveConv = useCallback((id) => emit("conv:leave", { conversationId: id }), [emit]);

  const sendMsg = useCallback((conversationId, text, cb) => {
    emit("msg:send", { conversationId, text }, cb);
  }, [emit]);

  const sendTypingOn  = useCallback((id) => emit("typing:on",  { conversationId: id }), [emit]);
  const sendTypingOff = useCallback((id) => emit("typing:off", { conversationId: id }), [emit]);
  const sendRead      = useCallback((id) => emit("msg:read",   { conversationId: id }), [emit]);

  return (
    <Ctx.Provider value={{
      connected, onlineMap,
      on, off,
      joinConv, leaveConv,
      sendMsg, sendTypingOn, sendTypingOff, sendRead,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSocket must be inside SocketProvider");
  return ctx;
};