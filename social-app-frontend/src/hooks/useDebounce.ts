import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Tạo timeout để delay việc cập nhật giá trị
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function để clear timeout khi value hoặc delay thay đổi
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
