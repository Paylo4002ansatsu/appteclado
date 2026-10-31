import { useMemo } from 'react';
import { useCourseContent } from '../context/CourseContentContext';

/** Catálogo público somente leitura, derivado dos módulos publicados pela API. */
export function useVideoCatalog() {
  const { allTopics, loading, error, reload } = useCourseContent();
  const videos = useMemo(() => allTopics.flatMap((topic) => topic.videos), [allTopics]);
  return { videos, loading, error, reload };
}
