import { findTopic } from './curriculum';

export type VideoItem = {
  topicId: string;
  moduleId: string;
  topic: string;
  title: string;
  channel: string;
  url: string;
  badge: 'Melhor didática' | 'Mais recomendado';
  note: string;
  didacticEvidence: string;
  commentsEvidence: string;
  audioVideoEvidence: string;
  viewsNote: string;
  evidenceUrls: string[];
};

const textFields: (keyof Omit<VideoItem, 'evidenceUrls' | 'badge'>)[] = [
  'topicId', 'moduleId', 'topic', 'title', 'channel', 'url', 'note',
  'didacticEvidence', 'commentsEvidence', 'audioVideoEvidence', 'viewsNote',
];

export function isVideoCatalog(value: unknown): value is VideoItem[] {
  if (!Array.isArray(value)) return false;
  const counts = new Map<string, number>();
  return value.every((raw) => {
    if (!raw || typeof raw !== 'object') return false;
    const item = raw as Partial<VideoItem>;
    if (!textFields.every((field) => typeof item[field] === 'string' && item[field]?.trim())) return false;
    if (item.badge !== 'Melhor didática' && item.badge !== 'Mais recomendado') return false;
    if (!Array.isArray(item.evidenceUrls) || !item.evidenceUrls.every((url) => typeof url === 'string' && /^https:\/\//.test(url))) return false;
    try {
      const url = new URL(item.url as string);
      if (url.protocol !== 'https:' || !['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'].includes(url.hostname)) return false;
    } catch {
      return false;
    }
    const topic = findTopic(item.topicId as string);
    if (!topic || topic.module.number > 10 || topic.module.id !== item.moduleId || topic.title !== item.topic) return false;
    const count = (counts.get(item.topicId as string) ?? 0) + 1;
    if (count > 3) return false;
    counts.set(item.topicId as string, count);
    return true;
  });
}
