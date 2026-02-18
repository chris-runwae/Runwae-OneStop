import { useEffect, useState } from "react";

export const COUNTDOWN_KEY = 120;

export const useCountdown = (
  initialSeconds = COUNTDOWN_KEY,
  restartTrigger?: unknown,
) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds, restartTrigger]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);
  // Convert seconds to minutes:seconds format
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
