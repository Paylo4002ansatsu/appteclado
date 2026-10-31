import { allTopics } from './curriculum';

const byModule: Record<number, string[][]> = {
  1: [['Dó', 'Mi', 'Sol'], ['Dó', 'Fá', 'Sol'], ['Dó'], ['Dó', 'Mi'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol']],
  2: [['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Ré', 'Mi', 'Fá', 'Sol'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Dó', 'Mi', 'Sol'], ['Dó', 'Mi', 'Sol']],
  3: [['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'], ['Dó sustenido', 'Ré sustenido', 'Fá sustenido'], ['Dó'], ['Dó'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']],
  4: [['Dó', 'Ré', 'Mi'], ['Dó', 'Ré', 'Mi', 'Fá'], ['Dó', 'Ré'], ['Dó', 'Sol'], ['Dó', 'Mi'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol']],
  5: [['Dó', 'Ré', 'Mi'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol']],
  6: [['Mi', 'Sol', 'Si', 'Ré', 'Fá'], ['Mi', 'Fá', 'Sol', 'Lá', 'Si'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Fá sustenido', 'Dó sustenido'], ['Dó', 'Ré'], ['Dó', 'Mi', 'Sol']],
  7: [['Dó', 'Mi', 'Sol'], ['Lá', 'Dó', 'Mi', 'Sol'], ['Dó', 'Ré', 'Mi', 'Sol'], ['Dó', 'Ré', 'Mi', 'Sol'], ['Dó', 'Mi', 'Sol']],
  8: [['Dó', 'Dó sustenido', 'Ré'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'], ['Sol', 'Lá', 'Si', 'Dó', 'Ré', 'Mi', 'Fá sustenido'], ['Fá', 'Sol', 'Lá', 'Si bemol', 'Dó', 'Ré', 'Mi'], ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Lá', 'Si', 'Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Dó', 'Mi', 'Lá'], ['Dó', 'Sol', 'Ré', 'Fá', 'Si bemol']],
  9: [['Dó', 'Ré', 'Mi', 'Fá', 'Sol'], ['Dó', 'Ré sustenido', 'Mi', 'Sol'], ['Dó', 'Ré', 'Sol'], ['Dó', 'Mi', 'Fá', 'Sol']],
  10: [['Dó', 'Mi', 'Sol'], ['Dó', 'Ré sustenido', 'Sol'], ['Si', 'Ré', 'Fá'], ['Dó', 'Mi', 'Sol sustenido'], ['Dó', 'Mi', 'Sol'], ['Dó', 'Mi', 'Sol'], ['Dó', 'Ré', 'Mi', 'Sol', 'Lá'], ['Dó', 'Ré', 'Fá', 'Sol']],
};

const flatToEnharmonic: Record<string, string> = {
  'Si bemol': 'Lá sustenido',
  'Mi bemol': 'Ré sustenido',
  'Lá bemol': 'Sol sustenido',
  'Ré bemol': 'Dó sustenido',
  'Dó bemol': 'Si',
};

export const topicHighlights = Object.fromEntries(allTopics
  .filter((topic) => topic.module.number <= 15)
  .map((topic) => {
    const patterns = byModule[topic.module.number] ?? [];
    const index = topic.module.topics.findIndex((entry) => entry.id === topic.id);
    const notes = patterns[index] ?? ['Dó', 'Ré', 'Mi', 'Fá', 'Sol'];
    return [topic.id, notes.map((note) => flatToEnharmonic[note] ?? note)];
  }));
