import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type BoardingState = {
  interests: string[];
  companion: string | null;
  budget: string | null;
};

type BoardingContextValue = BoardingState & {
  setInterests: (interests: string[]) => void;
  setCompanion: (companion: string | null) => void;
  setBudget: (budget: string | null) => void;
  collectedTags: () => string[];
  reset: () => void;
};

const BoardingContext = createContext<BoardingContextValue | null>(null);

export const BoardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [interests, setInterests] = useState<string[]>([]);
  const [companion, setCompanion] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);

  const reset = useCallback(() => {
    setInterests([]);
    setCompanion(null);
    setBudget(null);
  }, []);

  const collectedTags = useCallback(() => {
    const tags: string[] = [];
    for (const i of interests) tags.push(i.trim());
    if (companion) tags.push(companion.trim());
    if (budget) tags.push(budget.trim());
    return tags.filter((t) => t.length > 0);
  }, [interests, companion, budget]);

  const value = useMemo<BoardingContextValue>(
    () => ({
      interests,
      companion,
      budget,
      setInterests,
      setCompanion,
      setBudget,
      collectedTags,
      reset,
    }),
    [interests, companion, budget, collectedTags, reset],
  );

  return (
    <BoardingContext.Provider value={value}>
      {children}
    </BoardingContext.Provider>
  );
};

export const useBoarding = () => {
  const ctx = useContext(BoardingContext);
  if (!ctx) {
    throw new Error('useBoarding must be used within BoardingProvider');
  }
  return ctx;
};
