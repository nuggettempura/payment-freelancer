import { useState, useEffect } from "react";

// Returns a version of `value` that only updates after the user has stopped
// changing it for `delay` milliseconds. Prevents firing an API call on every
// single keystroke.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Cleanup: if `value` changes before the delay is up, cancel the previous
    // timer and start a fresh one. This is why rapid typing only fires once.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
