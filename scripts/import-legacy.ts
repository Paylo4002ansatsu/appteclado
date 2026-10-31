import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { eq, sql } from 'drizzle-orm';
import { levels as legacyLevels } from './fixtures/legacy/curriculum.ts';
import { lessons } from './fixtures/legacy/lessons.ts';
import { quizFor } from './fixtures/legacy/quizzes.ts';
import { glossary } from './fixtures/legacy/glossary.ts';
import { topicHighlights } from './fixtures/legacy/topicHighlights.ts';
import { chordLessons } from './fixtures/legacy/chordLessons.ts';
import type { CourseTopicData, ModuleSnapshot, VideoItem } from '../src/data/courseTypes.ts';
import { db, pool } from '../server/db/client.js';
import { contentMigrations, glossaryEntries, levels, modules } from '../server/db/schema.js';
import { normalizeYoutubeUrl, parseModuleSnapshot } from '../server/lib/content.js';

const MIGRATION_KEY = 'legacy-course-v1';
// Fixture somente de migração; o site público lê os vídeos do MySQL.
const videoJson = JSON.parse(await readFile(new URL('./fixtures/videos.json', import.meta.url), 'utf8')) as Array<Record<string, unknown>>;

function glossaryId(term: string): string {
  const normalized = term.normalize('NFKC').trim().toLocaleLowerCase('pt-BR');
  return `glossary-${createHash('sha256').update(normalized).digest('hex').slice(0, 24)}`;
}

function makeSnapshots() {
  const videosByTopic = new Map<string, VideoItem[]>();
  const videoSequence = new Map<string, number>();
  for (const raw of videoJson) {
    const topicId = String(raw.topicId ?? '');
    const index = (videoSequence.get(topicId) ?? 0) + 1;
    videoSequence.set(topicId, index);
    const video: VideoItem = {
      id: `${topicId}-v${index}`,
      topicId,
      moduleId: String(raw.moduleId ?? ''),
      topic: String(raw.topic ?? ''),
      title: String(raw.title ?? ''),
      channel: String(raw.channel ?? ''),
      url: normalizeYoutubeUrl(String(raw.url ?? '')),
      description: '',
      badge: raw.badge as VideoItem['badge'],
      note: String(raw.note ?? ''),
      didacticEvidence: String(raw.didacticEvidence ?? ''),
      commentsEvidence: String(raw.commentsEvidence ?? ''),
      audioVideoEvidence: String(raw.audioVideoEvidence ?? ''),
      viewsNote: String(raw.viewsNote ?? ''),
      evidenceUrls: Array.isArray(raw.evidenceUrls) ? raw.evidenceUrls.map(String) : [],
      sortOrder: index - 1,
    };
    const group = videosByTopic.get(topicId) ?? [];
    group.push(video);
    videosByTopic.set(topicId, group);
  }

  const result: Array<{ level: (typeof legacyLevels)[number]; module: (typeof legacyLevels)[number]['modules'][number]; snapshot: ModuleSnapshot }> = [];
  for (const level of legacyLevels) {
    level.modules.forEach((courseModule, index) => {
      const topics: CourseTopicData[] = courseModule.topics.map((topic) => {
        const legacyLesson = lessons[topic.id];
        const groupedVideos = videosByTopic.get(topic.id) ?? [];
        for (const video of groupedVideos) {
          if (video.moduleId !== courseModule.id || video.topic !== topic.title) throw new Error(`Video metadata mismatch for ${topic.id}.`);
        }
        return {
          id: topic.id,
          title: topic.title,
          ...(legacyLesson ? { lesson: { ...legacyLesson } } : {}),
          highlight: legacyLesson?.highlight ?? topicHighlights[topic.id] ?? [],
          ...(chordLessons[topic.id] ? { chordLesson: chordLessons[topic.id] } : {}),
          videos: groupedVideos,
        };
      });
      const snapshot = parseModuleSnapshot({
        title: courseModule.title,
        description: '',
        topics,
        quiz: quizFor(courseModule.id),
      }, courseModule.id);
      result.push({ level, module: courseModule, snapshot });
    });
  }
  if (videoSequence.size !== new Set(videoJson.map((row) => String(row.topicId))).size) throw new Error('Video grouping validation failed.');
  return result;
}

const records = makeSnapshots();
let didImport = false;
try {
  await db.transaction(async (tx) => {
    const [existing] = await tx.select({ key: contentMigrations.key }).from(contentMigrations).where(eq(contentMigrations.key, MIGRATION_KEY)).limit(1);
    if (existing) return;

    await tx.insert(levels).values(legacyLevels.map((level) => ({
      id: level.id, number: level.number, title: level.title, subtitle: level.subtitle,
      color: level.color, sortOrder: legacyLevels.findIndex((candidate) => candidate.id === level.id),
    }))).onDuplicateKeyUpdate({ set: { id: sql`id` } });

    await tx.insert(modules).values(records.map(({ level, module, snapshot }) => ({
      id: module.id,
      number: module.number,
      levelId: level.id,
      sortOrder: level.modules.findIndex((candidate) => candidate.id === module.id),
      readiness: module.number <= 15 ? 'ready' as const : 'planned' as const,
      isPublished: true,
      draftContent: snapshot,
      publishedContent: snapshot,
      publishedMetadata: {
        levelId: level.id,
        number: module.number,
        sortOrder: level.modules.findIndex((candidate) => candidate.id === module.id),
        readiness: module.number <= 15 ? 'ready' as const : 'planned' as const,
      },
    }))).onDuplicateKeyUpdate({ set: { id: sql`id` } });

    await tx.insert(glossaryEntries).values(glossary.map((entry) => ({
      id: glossaryId(entry.term), ...entry,
      draftTerm: entry.term, draftDefinition: entry.definition, draftGroup: entry.group, isPublished: true,
    })))
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    await tx.insert(contentMigrations).values({
      key: MIGRATION_KEY,
      metadata: {
        importedAt: new Date().toISOString(),
        levels: legacyLevels.length,
        modules: records.length,
        topics: records.reduce((sum, item) => sum + item.module.topics.length, 0),
        lessonCount: Object.keys(lessons).length,
        curatedVideoRows: videoJson.length,
        quizQuestions: records.reduce((sum, item) => sum + item.snapshot.quiz.length, 0),
        glossaryEntries: glossary.length,
      },
    }).onDuplicateKeyUpdate({ set: { key: sql`key_name` } });
    didImport = true;
  });
  console.log(didImport ? `Legacy content import completed for ${records.length} modules.` : `Legacy content import skipped: ${MIGRATION_KEY} is already recorded.`);
} finally {
  await pool.end();
}
