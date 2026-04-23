import { useEffect, useState } from "react";

/**
 * Reusable hook to detect if a component is mounted on the client.
 * Use this to avoid hydration mismatches when rendering client-only logic.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
