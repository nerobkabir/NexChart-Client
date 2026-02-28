import { initials } from "@/lib/utils";

export default function Avatar({ src, name = "", size = 10, online = false, className = "" }) {
  const px = size * 4; // Tailwind size to px approximation

  const sizeStyle = {
    width:  `${size * 4}px`,
    height: `${size * 4}px`,
    minWidth: `${size * 4}px`,
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={sizeStyle}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-semibold text-text-2 select-none"
          style={{
            background: "linear-gradient(135deg, #141F33 0%, #1A2840 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: `${Math.max(size * 1.4, 11)}px`,
          }}>
          {initials(name) || "?"}
        </div>
      )}
    </div>
  );
}