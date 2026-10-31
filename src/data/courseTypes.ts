export type ContentReadiness = 'ready' | 'planned';
export type PublicationStatus = 'draft' | 'published';

export type LessonContent = {
  explanation: string;
  example: string;
  exercises: string[];
  checklist: string[];
  highlight?: string[];
};

export type VideoItem = {
  id: string;
  topicId: string;
  moduleId: string;
  topic: string;
  title: string;
  channel: string;
  url: string;
  description: string;
  durationSeconds?: number;
  badge: 'Melhor didática' | 'Mais recomendado';
  note: string;
  didacticEvidence: string;
  commentsEvidence: string;
  audioVideoEvidence: string;
  viewsNote: string;
  evidenceUrls: string[];
  sortOrder: number;
};

export type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type GlossaryEntry = {
  id: string;
  term: string;
  definition: string;
  group: string;
};

export type GlossaryDraftContent = Pick<GlossaryEntry, 'term' | 'definition' | 'group'>;

export type AdminGlossaryRecord = {
  id: string;
  draftContent: GlossaryDraftContent;
  publishedContent: GlossaryDraftContent | null;
  isPublished: boolean;
  hasPendingChanges: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChordOption = {
  id: string;
  label: string;
  group?: string;
  midi: number[];
  notes: string[];
  arpeggioMidi: number[];
};

export type ChordLessonConfig = {
  prompt: string;
  playSequenceLabel?: string;
  options: ChordOption[];
};

export type CourseTopicData = {
  id: string;
  title: string;
  lesson?: LessonContent;
  highlight: string[];
  chordLesson?: ChordLessonConfig;
  videos: VideoItem[];
};

export type ModuleSnapshot = {
  title: string;
  description: string;
  topics: CourseTopicData[];
  quiz: QuizQuestion[];
};

export type PublishedModuleMetadata = {
  levelId: string;
  number: number;
  sortOrder: number;
  readiness: ContentReadiness;
};

export type PublicModuleData = ModuleSnapshot & {
  id: string;
  number: number;
  levelId: string;
  sortOrder: number;
  readiness: ContentReadiness;
  isPublished: true;
};

export type PublicLevelData = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  color: string;
  sortOrder: number;
  modules: PublicModuleData[];
};

export type PublicCourseResponse = {
  version: string;
  levels: PublicLevelData[];
  glossary: GlossaryEntry[];
};

export type AdminModuleRecord = {
  id: string;
  number: number;
  levelId: string;
  sortOrder: number;
  readiness: ContentReadiness;
  isPublished: boolean;
  draftContent: ModuleSnapshot;
  publishedContent: ModuleSnapshot | null;
  hasPendingChanges: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ModuleViewData = PublicModuleData & {
  level: PublicLevelData;
};

export type TopicViewData = CourseTopicData & {
  module: ModuleViewData;
  level: PublicLevelData;
};

export type AdminSessionResponse = {
  authenticated: boolean;
  email?: string;
  csrfToken?: string;
};
