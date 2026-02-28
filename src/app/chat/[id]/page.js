"use client";
import { useParams, useContext } from "react";
import { MobileMenuContext } from "../layout";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ConversationPage() {
  const { id } = useParams();
  const onMenuClick = useContext(MobileMenuContext);

  return <ChatWindow conversationId={id} onMenuClick={onMenuClick} />;
}