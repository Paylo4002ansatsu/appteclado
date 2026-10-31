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

const noteNames = ['Dó', 'Dó sustenido', 'Ré', 'Ré sustenido', 'Mi', 'Fá', 'Fá sustenido', 'Sol', 'Sol sustenido', 'Lá', 'Lá sustenido', 'Si'];

function option(
  id: string,
  label: string,
  midi: number[],
  settings: { spellings?: string[]; arpeggioMidi?: number[]; group?: string } = {},
): ChordOption {
  return {
    id,
    label,
    ...(settings.group ? { group: settings.group } : {}),
    midi,
    notes: midi.map((pitch, index) => `${settings.spellings?.[index] ?? noteNames[pitch % 12]}${Math.floor(pitch / 12) - 1}`),
    arpeggioMidi: settings.arpeggioMidi ?? midi,
  };
}

const cMajor = option('c-major', 'Dó maior (C)', [60, 64, 67]);
const fMajor = option('f-major', 'Fá maior (F)', [65, 69, 72]);
const gMajor = option('g-major', 'Sol maior (G)', [67, 71, 74]);
const aMinor = option('a-minor', 'Lá menor (Am)', [69, 72, 76]);
const dMinor = option('d-minor', 'Ré menor (Dm)', [62, 65, 69]);
const g7 = option('g7', 'Sol dominante com sétima (G7)', [67, 71, 74, 77]);
const fMinor = option('f-minor', 'Fá menor (Fm)', [65, 68, 72], { spellings: ['Fá', 'Lá bemol', 'Dó'] });

type ChordFamily = { id: string; name: string; suffix: string; intervals: number[] };

const chromaticRoots = [
  { id: 'c', midi: 60, name: 'Dó', symbol: 'C' },
  { id: 'c-sharp', midi: 61, name: 'Dó sustenido', symbol: 'C#' },
  { id: 'd', midi: 62, name: 'Ré', symbol: 'D' },
  { id: 'e-flat', midi: 63, name: 'Mi bemol', symbol: 'Eb' },
  { id: 'e', midi: 64, name: 'Mi', symbol: 'E' },
  { id: 'f', midi: 65, name: 'Fá', symbol: 'F' },
  { id: 'f-sharp', midi: 66, name: 'Fá sustenido', symbol: 'F#' },
  { id: 'g', midi: 67, name: 'Sol', symbol: 'G' },
  { id: 'a-flat', midi: 68, name: 'Lá bemol', symbol: 'Ab' },
  { id: 'a', midi: 69, name: 'Lá', symbol: 'A' },
  { id: 'b-flat', midi: 70, name: 'Si bemol', symbol: 'Bb' },
  { id: 'b', midi: 71, name: 'Si', symbol: 'B' },
];

const chromaticNoteNames = ['Dó', 'Dó sustenido', 'Ré', 'Mi bemol', 'Mi', 'Fá', 'Fá sustenido', 'Sol', 'Lá bemol', 'Lá', 'Si bemol', 'Si'];

function familyOptions(family: ChordFamily, group?: string): ChordOption[] {
  return chromaticRoots.map((root) => {
    const midi = family.intervals.map((interval) => root.midi + interval);
    const label = group
      ? `${root.name} (${root.symbol}${family.suffix})`
      : `${root.name} ${family.name} (${root.symbol}${family.suffix})`;
    return option(
      `${family.id}-${root.id}`,
      label,
      midi,
      {
        spellings: midi.map((pitch) => chromaticNoteNames[pitch % 12]),
        ...(group ? { group } : {}),
      },
    );
  });
}

const majorTriads = familyOptions({ id: 'triad-major', name: 'maior', suffix: '', intervals: [0, 4, 7] });
const minorTriads = familyOptions({ id: 'triad-minor', name: 'menor', suffix: 'm', intervals: [0, 3, 7] });
const diminishedTriads = familyOptions({ id: 'triad-diminished', name: 'diminuto', suffix: 'dim', intervals: [0, 3, 6] });
const augmentedTriads = familyOptions({ id: 'triad-augmented', name: 'aumentado', suffix: 'aug', intervals: [0, 4, 8] });
const majorSevenths = familyOptions({ id: 'major-seventh', name: 'com sétima maior', suffix: 'maj7', intervals: [0, 4, 7, 11] });
const minorSevenths = familyOptions({ id: 'minor-seventh', name: 'menor com sétima', suffix: 'm7', intervals: [0, 3, 7, 10] });
const dominantSevenths = familyOptions({ id: 'dominant-seventh', name: 'dominante com sétima', suffix: '7', intervals: [0, 4, 7, 10] });
const halfDiminishedSevenths = familyOptions(
  { id: 'half-diminished-seventh', name: 'meio-diminuto', suffix: 'm7♭5', intervals: [0, 3, 6, 10] },
  'Meio-diminutos · m7♭5',
);
const diminishedSevenths = familyOptions(
  { id: 'diminished-seventh', name: 'diminuto com sétima', suffix: 'dim7', intervals: [0, 3, 6, 9] },
  'Diminutos com 7ª · dim7',
);

const byTopic: Record<string, ChordLessonConfig> = {
  'n2-m10-t1': {
    prompt: 'Explore as 12 tríades maiores, uma para cada fundamental. A terça maior dá a cor característica do acorde.',
    options: majorTriads,
  },
  'n2-m10-t2': {
    prompt: 'Explore as 12 tríades menores. Compare a terça menor e a sonoridade de cada fundamental.',
    options: minorTriads,
  },
  'n2-m10-t3': {
    prompt: 'Explore as 12 tríades diminutas. Cada acorde reúne duas terças menores.',
    options: diminishedTriads,
  },
  'n2-m10-t4': {
    prompt: 'Explore as 12 tríades aumentadas. A quinta sobe um semitom; algumas posições têm a mesma coleção de sons por simetria.',
    options: augmentedTriads,
  },
  'n2-m10-t5': {
    prompt: 'As inversões mantêm as mesmas notas; muda apenas qual delas fica mais grave.',
    options: [
      option('c-root', 'Posição fundamental: C–E–G', [60, 64, 67]),
      option('c-first', '1ª inversão: E–G–C', [64, 67, 72]),
      option('c-second', '2ª inversão: G–C–E', [67, 72, 76]),
    ],
  },
  'n2-m10-t6': {
    prompt: 'Ouça como as notas do mesmo acorde podem ser distribuídas por duas regiões do teclado.',
    options: [
      option('c-two-hands', 'Dó maior em duas regiões', [60, 67, 72, 76, 79]),
      option('f-two-hands', 'Fá maior em duas regiões', [65, 72, 77, 81, 84]),
      option('g-two-hands', 'Sol maior em duas regiões', [67, 74, 79, 83]),
    ],
  },
  'n2-m10-t7': {
    prompt: 'Compare a sequência de acordes e escolha cada sonoridade para praticar uma troca tranquila.',
    options: [cMajor, gMajor, aMinor, fMajor],
  },
  'n2-m10-t8': {
    prompt: 'No sus2, a terça é substituída pela segunda; no sus4, pela quarta. A resolução pode voltar à tríade maior.',
    options: [
      option('c-sus2', 'Dó sus2 (Csus2)', [60, 62, 67]),
      option('c-sus4', 'Dó sus4 (Csus4)', [60, 65, 67]),
      cMajor,
    ],
  },
  'n3-m11-t1': {
    prompt: 'Explore os acordes diatônicos de Dó maior e Lá menor natural. Os dois tons relativos compartilham as mesmas notas.',
    options: [
      option('c-major-i', 'I · C', [60, 64, 67], { group: 'Dó maior' }),
      option('c-major-ii', 'ii · Dm', [62, 65, 69], { group: 'Dó maior' }),
      option('c-major-iii', 'iii · Em', [64, 67, 71], { group: 'Dó maior' }),
      option('c-major-iv', 'IV · F', [65, 69, 72], { group: 'Dó maior' }),
      option('c-major-v', 'V · G', [67, 71, 74], { group: 'Dó maior' }),
      option('c-major-vi', 'vi · Am', [69, 72, 76], { group: 'Dó maior' }),
      option('c-major-vii', 'vii° · Bdim', [71, 74, 77], { group: 'Dó maior' }),
      option('a-minor-i', 'i · Am', [69, 72, 76], { group: 'Lá menor natural' }),
      option('a-minor-ii', 'ii° · Bdim', [71, 74, 77], { group: 'Lá menor natural' }),
      option('a-minor-iii', 'III · C', [72, 76, 79], { group: 'Lá menor natural' }),
      option('a-minor-iv', 'iv · Dm', [74, 77, 81], { group: 'Lá menor natural' }),
      option('a-minor-v', 'v · Em', [76, 79, 83], { group: 'Lá menor natural' }),
      option('a-minor-vi', 'VI · F', [77, 81, 84], { group: 'Lá menor natural' }),
      option('a-minor-vii', 'VII · G', [67, 71, 74], { group: 'Lá menor natural' }),
    ],
  },
  'n3-m11-t2': {
    prompt: 'Selecione um grau do campo harmônico de Dó maior e ouça sua função como acorde.',
    options: [
      option('function-i', 'I · Tônica · C', [60, 64, 67]),
      option('function-ii', 'ii · Preparação · Dm', [62, 65, 69]),
      option('function-iii', 'iii · Em', [64, 67, 71]),
      option('function-iv', 'IV · Subdominante · F', [65, 69, 72]),
      option('function-v', 'V7 · Dominante · G7', [67, 71, 74, 77]),
      option('function-vi', 'vi · Am', [69, 72, 76]),
      option('function-vii', 'vii° · Bdim', [71, 74, 77]),
    ],
  },
  'n3-m11-t3': {
    prompt: 'A progressão usa os graus I, IV e V de Dó maior. Toque cada acorde e observe a tensão e a resolução.',
    options: [
      option('progression-i', 'I · Dó maior (C)', [60, 64, 67]),
      option('progression-iv', 'IV · Fá maior (F)', [65, 69, 72]),
      option('progression-v', 'V · Sol maior (G)', [67, 71, 74]),
    ],
  },
  'n3-m11-t4': {
    prompt: 'Selecione cada etapa da sequência I–V–vi–IV em Dó maior: C–G–Am–F.',
    options: [
      option('pop-i', 'I · Dó maior (C)', [60, 64, 67]),
      option('pop-v', 'V · Sol maior (G)', [67, 71, 74]),
      option('pop-vi', 'vi · Lá menor (Am)', [69, 72, 76]),
      option('pop-iv', 'IV · Fá maior (F)', [65, 69, 72]),
    ],
  },
  'n3-m11-t5': {
    prompt: 'A mesma coleção de acordes começa pelo vi. Selecione cada etapa da sequência Am–F–C–G.',
    options: [
      option('relative-vi', 'vi · Lá menor (Am)', [69, 72, 76]),
      option('relative-iv', 'IV · Fá maior (F)', [65, 69, 72]),
      option('relative-i', 'I · Dó maior (C)', [60, 64, 67]),
      option('relative-v', 'V · Sol maior (G)', [67, 71, 74]),
    ],
  },
  'n3-m11-t6': {
    prompt: 'Compare os acordes que podem aparecer numa música em Dó maior. O acorde de repouso e o final da frase ajudam a formular uma hipótese de tom.',
    options: [cMajor, g7, fMajor, aMinor, dMinor],
  },
  'n3-m11-t7': {
    prompt: 'Compare os acordes da progressão em Dó e os da transposição para Ré maior.',
    options: [
      option('transpose-c', 'Dó maior: C', [60, 64, 67]),
      option('transpose-f', 'Dó maior: F', [65, 69, 72]),
      option('transpose-g', 'Dó maior: G', [67, 71, 74]),
      option('transpose-d', 'Ré maior: D', [62, 66, 69]),
      option('transpose-a', 'Ré maior: A', [69, 73, 76]),
      option('transpose-bm', 'Ré maior: Bm', [71, 74, 78]),
      option('transpose-gd', 'Ré maior: G', [67, 71, 74]),
    ],
  },
  'n3-m12-t1': {
    prompt: 'Compare os 12 acordes com sétima maior (maj7), um para cada fundamental.',
    options: majorSevenths,
  },
  'n3-m12-t2': {
    prompt: 'Compare os 12 acordes menores com sétima (m7), um para cada fundamental.',
    options: minorSevenths,
  },
  'n3-m12-t3': {
    prompt: 'Compare os 12 acordes dominantes com sétima (7), um para cada fundamental. Todos têm uma sétima menor.',
    options: dominantSevenths,
  },
  'n3-m12-t4': {
    prompt: 'Compare as 12 versões de cada família. No meio-diminuto a sétima é menor; no diminuto com sétima ela é ainda mais baixa.',
    options: [...halfDiminishedSevenths, ...diminishedSevenths],
  },
  'n3-m12-t5': {
    prompt: 'As quatro inversões mantêm as notas C–E–G–B. Ouça como muda o baixo.',
    options: [
      option('maj7-root', 'Fundamental: C–E–G–B', [60, 64, 67, 71]),
      option('maj7-first', '1ª inversão: E–G–B–C', [64, 67, 71, 72]),
      option('maj7-second', '2ª inversão: G–B–C–E', [67, 71, 72, 76]),
      option('maj7-third', '3ª inversão: B–C–E–G', [71, 72, 76, 79]),
    ],
  },
  'n3-m12-t6': {
    prompt: 'Escolha os acordes da progressão ii–V–I em Dó maior ou em Sol maior.',
    options: [
      option('c-ii', 'Dó maior · ii · Dm7', [62, 65, 69, 72]),
      option('c-v', 'Dó maior · V · G7', [67, 71, 74, 77]),
      option('c-i', 'Dó maior · I · Cmaj7', [60, 64, 67, 71]),
      option('g-ii', 'Sol maior · ii · Am7', [69, 72, 76, 79]),
      option('g-v', 'Sol maior · V · D7', [62, 66, 69, 72]),
      option('g-i', 'Sol maior · I · Gmaj7', [67, 71, 74, 78]),
    ],
  },
  'n3-m13-t1': {
    prompt: 'Selecione uma extensão sobre G7. O exemplo distribui as notas para manter cada voicing audível.',
    options: [
      option('g9', 'Sol 9 (G9)', [67, 71, 77, 81]),
      option('g11', 'Sol 11 (G11)', [67, 71, 77, 81, 84]),
      option('g13', 'Sol 13 (G13)', [67, 71, 76, 77, 81]),
    ],
  },
  'n3-m13-t2': {
    prompt: 'Ouça como uma alteração muda a cor do dominante antes da resolução em Dó.',
    options: [
      g7,
      option('g7-flat9', 'G7♭9', [67, 71, 74, 77, 80], { spellings: ['Sol', 'Si', 'Ré', 'Fá', 'Lá bemol'] }),
      option('g7-sharp5', 'G7♯5', [67, 71, 75, 77], { spellings: ['Sol', 'Si', 'Ré sustenido', 'Fá'] }),
    ],
  },
  'n3-m13-t3': {
    prompt: 'O acorde antes da barra e o baixo depois dela têm funções distintas. Experimente três slash chords.',
    options: [
      option('c-over-e', 'Dó maior com Mi no baixo (C/E)', [64, 67, 72]),
      option('d-over-fs', 'Ré maior com Fá♯ no baixo (D/F♯)', [66, 69, 74]),
      option('g-over-b', 'Sol maior com Si no baixo (G/B)', [71, 74, 79]),
    ],
  },
  'n3-m13-t4': {
    prompt: 'Compare acordes emprestados do modo menor com os acordes diatônicos de Dó maior.',
    options: [
      cMajor,
      fMajor,
      fMinor,
      option('bb-major', 'Si♭ maior (B♭)', [70, 74, 77], { spellings: ['Si bemol', 'Ré', 'Fá'] }),
    ],
  },
  'n3-m13-t5': {
    prompt: 'Selecione a dominante secundária e ouça a tensão antes do acorde-alvo.',
    options: [
      option('d7-to-g', 'V7/V · D7 → G', [62, 66, 69, 72]),
      option('a7-to-dm', 'V7/ii · A7 → Dm', [69, 73, 76, 79]),
      option('e7-to-am', 'V7/vi · E7 → Am', [64, 68, 71, 74]),
    ],
  },
  'n3-m13-t6': {
    prompt: 'Compare os acordes que preparam a passagem de Dó maior para Sol maior.',
    options: [
      option('mod-c', 'Ponto de partida · C', [60, 64, 67]),
      option('mod-f', 'Tom de origem · IV · F', [65, 69, 72]),
      option('mod-am', 'Acorde comum · Am', [69, 72, 76]),
      option('mod-d7', 'Dominante da nova tonalidade · D7', [62, 66, 69, 72]),
      option('mod-g', 'Nova tônica · G', [67, 71, 74]),
    ],
  },
  'n3-m14-t1': {
    prompt: 'Escolha uma harmonia de exemplo e ouça o acorde junto ou em um padrão de baixo e quinta para a mão esquerda.',
    playSequenceLabel: 'Ouvir padrão',
    options: [
      option('left-c-fifth', 'Dó maior · baixo e quinta', [60, 64, 67], { arpeggioMidi: [60, 67, 72, 67] }),
      option('left-f-fifth', 'Fá maior · baixo e quinta', [65, 69, 72], { arpeggioMidi: [65, 72, 77, 72] }),
      option('left-g-fifth', 'Sol maior · baixo e quinta', [67, 71, 74], { arpeggioMidi: [67, 74, 79, 74] }),
      option('left-c-octaves', 'Dó maior · padrão de oitavas', [60, 64, 67], { arpeggioMidi: [60, 72, 60, 72] }),
    ],
  },
  'n3-m14-t2': {
    prompt: 'Use um acorde como base e ouça a pulsação da mão esquerda alternando a fundamental e a quinta.',
    playSequenceLabel: 'Ouvir padrão',
    options: [
      option('pulse-c', 'Dó maior · pulsação', [60, 64, 67], { arpeggioMidi: [60, 60, 67, 60] }),
      option('pulse-f', 'Fá maior · pulsação', [65, 69, 72], { arpeggioMidi: [65, 65, 72, 65] }),
      option('pulse-g', 'Sol maior · pulsação', [67, 71, 74], { arpeggioMidi: [67, 67, 74, 67] }),
    ],
  },
  'n3-m14-t3': {
    prompt: 'Selecione os acordes da sequência C–F–G–C e ouça cada sonoridade em bloco ou em arpejo.',
    options: [cMajor, fMajor, gMajor],
  },
  'n3-m14-t4': {
    prompt: 'Use acordes familiares para testar posições e acompanhamentos sem competir com a voz.',
    options: [cMajor, aMinor, fMajor, gMajor],
  },
  'n3-m14-t5': {
    prompt: 'Ouça cada acorde do percurso C–F–G–C e escolha uma inversão que reduza o movimento entre as vozes.',
    options: [
      option('voice-c', 'Dó maior · C–E–G', [60, 64, 67]),
      option('voice-f', 'Fá maior · C–F–A', [60, 65, 69]),
      option('voice-g', 'Sol maior · B–D–G', [71, 74, 79]),
    ],
  },
  'n3-m15-t2': {
    prompt: 'Escolha uma tríade. O botão de arpejo percorre as notas subindo e voltando, sem precisar tocar tecla por tecla.',
    options: [
      option('arp-c', 'Dó maior (C)', [60, 64, 67], { arpeggioMidi: [60, 64, 67, 72, 67, 64, 60] }),
      option('arp-g', 'Sol maior (G)', [67, 71, 74], { arpeggioMidi: [67, 71, 74, 79, 74, 71, 67] }),
      option('arp-am', 'Lá menor (Am)', [69, 72, 76], { arpeggioMidi: [69, 72, 76, 81, 76, 72, 69] }),
    ],
  },
};

export const chordLessons = byTopic;
