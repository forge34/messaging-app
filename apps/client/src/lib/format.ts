export function formatTime(date: Date | string) {
  const now = typeof date === "string" ? new Date(date) : date;
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function relativeParts(date: Date | string) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);
  if (seconds < 60) return { value: 0, unit: "now" } as const;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return { value: minutes, unit: "minutes" } as const;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { value: hours, unit: "hours" } as const;
  const days = Math.floor(hours / 24);
  return { value: days, unit: "days" } as const;
}

export function relativeTime(date: Date | string) {
  const { value, unit } = relativeParts(date);
  switch (unit) {
    case "now":
      return "just now";
    case "minutes":
      return `${value}m ago`;
    case "hours":
      return `${value}h ago`;
    case "days":
      return `${value}d ago`;
  }
}

export function lastSeenText(lastSeen?: Date | string | null) {
  if (!lastSeen) return null;

  const { value, unit } = relativeParts(lastSeen);
  switch (unit) {
    case "now":
      return "Last seen just now";
    case "minutes":
      return `Last seen ${value} minute${value > 1 ? "s" : ""} ago`;
    case "hours":
      return `Last seen ${value} hour${value > 1 ? "s" : ""} ago`;
    case "days":
      return `Last seen ${value} day${value > 1 ? "s" : ""} ago`;
  }
}

export function messagePreview(message: {
  body?: string | null;
  attachment?: { type: string } | null;
}) {
  if (message.body) return message.body;
  if (!message.attachment) return null;
  return message.attachment.type === "STICKER" ? "Sticker" : "Photo";
}
