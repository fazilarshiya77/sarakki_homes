import { useEffect, useState } from "react";

/** Returns `value`, delayed by `delayMs` and only updated once the caller
 *  stops changing it — the standard search-input pattern so every
 *  keystroke doesn't fire its own network request. Used by CRM list
 *  pages (Properties, and any future Leads/Customers search) instead of
 *  reimplementing the same setTimeout/clearTimeout dance per page. */
export function useDebounce<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
