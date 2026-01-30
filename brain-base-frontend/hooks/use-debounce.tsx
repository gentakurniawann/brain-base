import { useState, useEffect } from "react";

/**
 * useDebounce hook
 * @param value
 * @param delay
 * @returns
 * @example
 * const debouncedValue = useDebounce(value, 500);
 */
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
