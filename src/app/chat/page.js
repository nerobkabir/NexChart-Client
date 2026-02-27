export default function ChatIndex() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
      <div className="w-20 h-20 rounded-3xl bg-ink-2 border border-ink-4 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-ink-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-snow font-semibold text-lg mb-1">Your messages</h2>
      <p className="text-mist text-sm max-w-xs leading-relaxed">
        Select a conversation or press <span className="text-primary font-medium">+</span> to start a new one.
      </p>
    </div>
  );
}