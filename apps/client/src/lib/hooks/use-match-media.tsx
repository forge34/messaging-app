// Logic from https://github.com/streamich/react-use/blob/master/src/useMedia.ts

import { useState, useEffect } from "react";

export const media = {
  sm: "(width >= 40rem)",
  md: "(width >= 48rem)",
  lg: "(width >= 64rem)",
} as const;

type MediaQuery = (typeof media)[keyof typeof media];

export function useMatchMedia(query: MediaQuery) {
  const getMatches = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function useBreakpoint() {
  const sm = useMatchMedia(media.sm);
  const md = useMatchMedia(media.md);
  const lg = useMatchMedia(media.lg);

  return { sm, md, lg };
}

