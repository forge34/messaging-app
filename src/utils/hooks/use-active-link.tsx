import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function useActiveLink({ link }: { link: string }) {
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(location.pathname.includes(link));
  }, [location.pathname, link]);

  const selected = isActive ? "selected" : "";
  return { selected, isActive };
}
