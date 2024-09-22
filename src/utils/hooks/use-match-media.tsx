import { useEffect, useMemo, useState } from "react";

export function useMatchMedia(query: string) {
  const mediaQuery = useMemo(() => window.matchMedia(query), [query]);
  const [matches,setMatches] = useState(mediaQuery.matches)

  useEffect(() => {
    const mediaOnChange = () => setMatches(mediaQuery.matches)
    mediaQuery.addEventListener("change", mediaOnChange)

    return () => mediaQuery.removeEventListener("change", mediaOnChange)
  },[mediaQuery])


  return { matches };
}
