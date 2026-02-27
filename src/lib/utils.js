import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

export const fmtTime = (d) => d ? format(new Date(d), "h:mm a") : "";

export const fmtSidebarDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
};

export const fmtLastSeen = (d) => {
  if (!d) return "Last seen recently";
  const date = new Date(d);
  if (isToday(date)) return `Last seen today at ${format(date, "h:mm a")}`;
  return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
};

export const fmtDateDivider = (d) => {
  const date = new Date(d);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

export const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");

export const trunc = (str = "", len = 38) =>
  str.length > len ? str.slice(0, len) + "…" : str;

export const isSameDay = (a, b) =>
  format(new Date(a), "yyyy-MM-dd") === format(new Date(b), "yyyy-MM-dd");