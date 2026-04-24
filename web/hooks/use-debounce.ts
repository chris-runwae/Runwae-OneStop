import { useCallback, useRef } from "react";

export const useDebounce = <T extends any[]>(
 fn: (...args: T) => void,
 delay: number
) => {
 const timeoutRef = useRef<NodeJS.Timeout | null>(null);

 const debounce = useCallback(
  (...args: T) => {
   if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
   }

   timeoutRef.current = setTimeout(() => {
    fn(...args);
   }, delay);
  },
  [fn, delay]
 );

 return debounce;
};
