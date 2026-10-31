import type { VideoItem } from './courseTypes';
export type { VideoItem } from './courseTypes';

// Kept for compatibility with the legacy local catalog utility; public pages use API data.
export function isVideoCatalog(value: unknown): value is VideoItem[] {
  if (!Array.isArray(value)) return false;
  return value.every((raw) => {
    if (!raw || typeof raw !== 'object') return false;
    const item = raw as Partial<VideoItem>;
    if (typeof item.id !== 'string' || typeof item.topicId !== 'string' || typeof item.moduleId !== 'string') return false;
    if (typeof item.topic !== 'string' || typeof item.title !== 'string' || typeof item.channel !== 'string' || typeof item.url !== 'string') return false;
    if (!item.url.trim() || !Array.isArray(item.evidenceUrls)) return false;
    return item.badge === 'Melhor didática' || item.badge === 'Mais recomendado';
  });
}
