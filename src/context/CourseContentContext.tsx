import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CourseTopicData, ModuleViewData, PublicCourseResponse, PublicLevelData, PublicModuleData, TopicViewData } from '../data/courseTypes';

type CourseContentValue = {
  course: PublicCourseResponse | null;
  levels: PublicLevelData[];
  allModules: ModuleViewData[];
  allTopics: TopicViewData[];
  readyTopics: TopicViewData[];
  glossary: PublicCourseResponse['glossary'];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  findModule: (id: string) => ModuleViewData | undefined;
  findTopic: (id: string) => TopicViewData | undefined;
};

const CourseContentContext = createContext<CourseContentValue | null>(null);

function isCourseResponse(value: unknown): value is PublicCourseResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PublicCourseResponse>;
  return typeof candidate.version === 'string' && Array.isArray(candidate.levels) && Array.isArray(candidate.glossary);
}

export function CourseContentProvider({ children }: { children: ReactNode }) {
  const [course, setCourse] = useState<PublicCourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loaded = useRef(false);
  const inFlight = useRef(false);

  const reload = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!loaded.current) setLoading(true);
    try {
      const response = await fetch('/api/public/course', { cache: 'no-store' });
      if (!response.ok) throw new Error('Não foi possível carregar o conteúdo do curso. Tente novamente em instantes.');
      const payload: unknown = await response.json();
      if (!isCourseResponse(payload)) throw new Error('O conteúdo recebido do servidor está incompleto.');
      setCourse(payload);
      setError('');
      loaded.current = true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao carregar o curso.');
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const refresh = () => { if (document.visibilityState === 'visible') void reload(); };
    const interval = window.setInterval(() => void reload(), 60_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [reload]);

  const derived = useMemo(() => {
    const levels = course?.levels ?? [];
    const allModules = levels.flatMap((level) => level.modules.map((module) => ({ ...module, level })));
    const allTopics = allModules.flatMap((module) => module.topics.map((topic: CourseTopicData) => ({ ...topic, module, level: module.level })));
    const readyTopics = allTopics.filter((topic) => topic.module.readiness === 'ready' && topic.lesson);
    return { levels, allModules, allTopics, readyTopics };
  }, [course]);

  const value = useMemo<CourseContentValue>(() => ({
    course,
    ...derived,
    glossary: course?.glossary ?? [],
    loading,
    error,
    reload,
    findModule: (id: string) => derived.allModules.find((module) => module.id === id),
    findTopic: (id: string) => derived.allTopics.find((topic) => topic.id === id),
  }), [course, derived, loading, error, reload]);

  return <CourseContentContext.Provider value={value}>{children}</CourseContentContext.Provider>;
}

export function useCourseContent() {
  const value = useContext(CourseContentContext);
  if (!value) throw new Error('useCourseContent precisa estar dentro de CourseContentProvider.');
  return value;
}

export function isModuleReady(module: Pick<PublicModuleData, 'readiness'> | undefined) {
  return module?.readiness === 'ready';
}
