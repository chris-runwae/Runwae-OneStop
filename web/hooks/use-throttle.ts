import { useCallback, useRef } from "react";

export const useThrottle = <T extends any[]>(
  fn: (...args: T) => void,
  delay: number,
) => {
  const lastCalled = useRef<number>(0);

  const throttle = useCallback(
    (...args: T) => {
      const now = Date.now();

      if (now - lastCalled.current >= delay) {
        lastCalled.current = now;
        fn(...args);
      }
    },
    [fn, delay],
  );

  return throttle;
};
