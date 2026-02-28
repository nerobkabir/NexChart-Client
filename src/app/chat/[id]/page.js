"use client";
import { use, useContext } from "react";
import { MobileMenuContext } from "../layout";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ConversationPage({ params }) {
  const { id } = use(params);
  const onMenuClick = useContext(MobileMenuContext);

  return <ChatWindow conversationId={id} onMenuClick={onMenuClick} />;
}