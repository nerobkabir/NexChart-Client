import { initials } from "@/lib/utils";

export default function Avatar({ src, name = "", size = 10, online = false, className = "" }) {
  const sz   = `w-${size} h-${size}`;
  const dot  = size >= 10 ? "w-3 h-3 border-2" : "w-2.5 h-2.5 border-2";

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name}
          className={`${sz} rounded-full object-cover`} />
      ) : (
        <div className={`${sz} rounded-full bg-ink-4 border border-ink-5 flex items-center justify-center
                         text-mist-2 font-semibold text-xs`}>
          {initials(name) || "?"}
        </div>
      )}
      {online && (
        <span className={`absolute bottom-0 right-0 ${dot} bg-primary border-ink-2 rounded-full`} />
      )}
    </div>
  );
}