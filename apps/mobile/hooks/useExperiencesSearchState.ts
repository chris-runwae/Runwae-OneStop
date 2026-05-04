import { useCallback, useMemo, useState } from 'react';

export type ExperienceCategory = 'all' | 'tour' | 'event' | 'eat' | 'adventure';

export type ExperiencesSearchState = {
  term: string | null;
  when: string | null; // ISO date or null = "Anytime"
  category: ExperienceCategory;
};

const INITIAL: ExperiencesSearchState = {
  term: null,
  when: null,
  category: 'all',
};

export function useExperiencesSearchState() {
  const [state, setState] = useState<ExperiencesSearchState>(INITIAL);

  const setTerm = useCallback(
    (term: string | null) =>
      setState((s) => ({ ...s, term: term?.trim() || null })),
    [],
  );
  const setWhen = useCallback(
    (when: string | null) => setState((s) => ({ ...s, when })),
    [],
  );
  const setCategory = useCallback(
    (category: ExperienceCategory) => setState((s) => ({ ...s, category })),
    [],
  );

  const isValid = useMemo(() => Boolean(state.term), [state.term]);

  const toQueryParams = useCallback((): Record<string, string> | null => {
    if (!state.term) return null;
    const params: Record<string, string> = {
      term: state.term,
      category: state.category,
    };
    if (state.when) params.when = state.when;
    return params;
  }, [state]);

  return {
    state,
    setTerm,
    setWhen,
    setCategory,
    isValid,
    toQueryParams,
  };
}
