import { z } from 'zod';
import type { ModuleSnapshot } from '../../src/data/courseTypes.js';

const nonEmpty = z.string().trim().min(1).max(20000);
const text = z.string().max(100000);
const textArray = z.array(z.string().max(20000)).max(500);

const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

export function normalizeYoutubeUrl(input: string): string {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error('URL do YouTube inválida.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || !youtubeHosts.has(parsed.hostname.toLowerCase()) || parsed.username || parsed.password || parsed.port) {
    throw new Error('Use uma URL válida de youtube.com, www.youtube.com, m.youtube.com ou youtu.be.');
  }
  const host = parsed.hostname.toLowerCase();
  let id: string | null = null;
  let outputHost = host;
  let path = parsed.pathname;
  let search = '';
  if (host === 'youtu.be') {
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length === 1) id = segments[0] ?? null;
    outputHost = 'youtu.be';
    path = id ? `/${id}` : parsed.pathname;
  } else if (parsed.pathname === '/watch') {
    id = parsed.searchParams.get('v');
    outputHost = 'www.youtube.com';
    path = '/watch';
    if (id) search = `?v=${encodeURIComponent(id)}`;
  } else {
    const match = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)\/?$/);
    if (match) {
      id = match[2] ?? null;
      outputHost = 'www.youtube.com';
      path = `/${match[1]}/${id}`;
    }
  }
  if (!id || !videoIdPattern.test(id)) throw new Error('A URL precisa apontar para um vídeo do YouTube com ID de 11 caracteres.');
  return `https://${outputHost}${path}${search}`;
}

const videoSchema = z.object({
  id: nonEmpty.max(128),
  topicId: nonEmpty.max(128),
  moduleId: nonEmpty.max(96),
  topic: nonEmpty.max(255),
  title: nonEmpty.max(500),
  channel: nonEmpty.max(255),
  url: z.string().trim().min(1).max(2048).transform((value) => normalizeYoutubeUrl(value)),
  description: z.string().max(10000).default(''),
  durationSeconds: z.number().int().positive().max(86400).optional(),
  badge: z.enum(['Melhor didática', 'Mais recomendado']),
  note: text,
  didacticEvidence: text,
  commentsEvidence: text,
  audioVideoEvidence: text,
  viewsNote: text,
  evidenceUrls: z.array(z.string().url().max(2048)).max(50),
  sortOrder: z.number().int().min(0).max(10000),
});

const lessonSchema = z.object({
  explanation: text,
  example: text,
  exercises: textArray,
  checklist: textArray,
  highlight: textArray.optional(),
});

const chordOptionSchema = z.object({
  id: nonEmpty.max(128),
  label: nonEmpty.max(255),
  group: z.string().max(255).optional(),
  midi: z.array(z.number().int().min(0).max(127)).max(64),
  notes: z.array(z.string().max(100)).max(64),
  arpeggioMidi: z.array(z.number().int().min(0).max(127)).max(128),
});

const chordLessonSchema = z.object({
  prompt: text,
  playSequenceLabel: z.string().max(255).optional(),
  options: z.array(chordOptionSchema).max(500),
});

const topicSchema = z.object({
  id: nonEmpty.max(128),
  title: nonEmpty.max(255),
  lesson: lessonSchema.optional(),
  highlight: textArray,
  chordLesson: chordLessonSchema.optional(),
  videos: z.array(videoSchema).max(100),
});

const quizQuestionSchema = z.object({
  prompt: nonEmpty.max(20000),
  options: z.array(nonEmpty.max(20000)).min(2).max(20),
  answer: z.number().int().min(0),
  explanation: text,
}).superRefine((question, context) => {
  if (question.answer >= question.options.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'A resposta do quiz precisa apontar para uma opção existente.', path: ['answer'] });
});

export const moduleSnapshotSchema = z.object({
  title: nonEmpty.max(255),
  description: text,
  topics: z.array(topicSchema).max(500),
  quiz: z.array(quizQuestionSchema).max(500),
}).superRefine((snapshot, context) => {
  const topicIds = new Set<string>();
  const videoIds = new Set<string>();
  snapshot.topics.forEach((topic, topicIndex) => {
    if (topicIds.has(topic.id)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'IDs de tópico devem ser únicos no módulo.', path: ['topics', topicIndex, 'id'] });
    topicIds.add(topic.id);
    topic.videos.forEach((video, videoIndex) => {
      if (videoIds.has(video.id)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'IDs de vídeo devem ser únicos no módulo.', path: ['topics', topicIndex, 'videos', videoIndex, 'id'] });
      videoIds.add(video.id);
      if (video.topicId !== topic.id) context.addIssue({ code: z.ZodIssueCode.custom, message: 'O vídeo precisa apontar para o tópico que o contém.', path: ['topics', topicIndex, 'videos', videoIndex, 'topicId'] });
    });
  });
});

export function parseModuleSnapshot(value: unknown, expectedModuleId?: string): ModuleSnapshot {
  const snapshot = moduleSnapshotSchema.parse(value) as ModuleSnapshot;
  if (expectedModuleId) {
    for (const topic of snapshot.topics) {
      for (const video of topic.videos) {
        if (video.moduleId !== expectedModuleId) throw new Error(`O vídeo ${video.id} precisa apontar para o módulo ${expectedModuleId}.`);
      }
    }
  }
  return snapshot;
}

export const glossaryInputSchema = z.object({
  term: nonEmpty.max(255),
  definition: nonEmpty.max(20000),
  group: nonEmpty.max(128),
});

export const moduleMetadataSchema = z.object({
  number: z.number().int().positive().max(100000),
  levelId: nonEmpty.max(64),
  sortOrder: z.number().int().min(0).max(100000),
  readiness: z.enum(['ready', 'planned']),
});
