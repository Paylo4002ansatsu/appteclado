import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type SavedState = {
  completed: string[];
  checks: Record<string, string[]>;
  quizScores: Record<string, number>;
  theme: 'light' | 'dark';
};
type ProgressContextValue = SavedState & {
  toggleCompleted: (topicId: string) => void;
  toggleCheck: (topicId: string, item: string) => void;
  saveQuiz: (moduleId: string, score: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

const KEY = 'trilha-do-teclado:v1';
const initial: SavedState = { completed: [], checks: {}, quizScores: {}, theme: 'light' };
const ProgressContext = createContext<ProgressContextValue | null>(null);

function readState(): SavedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      checks: parsed.checks && typeof parsed.checks === 'object' ? parsed.checks : {},
      quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return initial;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SavedState>(readState);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
    document.documentElement.dataset.theme = state.theme;
  }, [state]);

  const value = useMemo<ProgressContextValue>(() => ({
    ...state,
    toggleCompleted: (topicId) => setState((current) => ({
      ...current,
      completed: current.completed.includes(topicId)
        ? current.completed.filter((id) => id !== topicId)
        : [...current.completed, topicId],
    })),
    toggleCheck: (topicId, item) => setState((current) => {
      const currentItems = current.checks[topicId] ?? [];
      const nextItems = currentItems.includes(item) ? currentItems.filter((value) => value !== item) : [...currentItems, item];
      return { ...current, checks: { ...current.checks, [topicId]: nextItems } };
    }),
    saveQuiz: (moduleId, score) => setState((current) => ({ ...current, quizScores: { ...current.quizScores, [moduleId]: score } })),
    setTheme: (theme) => setState((current) => ({ ...current, theme })),
  }), [state]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress precisa estar dentro de ProgressProvider.');
  return value;
}
