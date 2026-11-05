import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scrollHighlightIntoView(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  requestAnimationFrame(() => {
    el.classList.add("highlight");

    setTimeout(() => {
      el.classList.remove("highlight");
    }, 1000);
  });
}
