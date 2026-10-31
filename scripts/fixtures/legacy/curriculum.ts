export type Topic = { id: string; title: string };
export type CourseModule = {
  id: string;
  number: number;
  title: string;
  topics: Topic[];
};
export type CourseLevel = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  color: string;
  modules: CourseModule[];
};

const makeModule = (number: number, title: string, topics: string[]): CourseModule => {
  const id = `n${number <= 5 ? 1 : number <= 10 ? 2 : number <= 15 ? 3 : number <= 19 ? 4 : number <= 22 ? 5 : 6}-m${number}`;
  return {
    id,
    number,
    title,
    topics: topics.map((topic, index) => ({ id: `${id}-t${index + 1}`, title: topic })),
  };
};

const levelOneModules = [
  makeModule(1, 'Conhecendo o instrumento', [
    'Tipos de teclado: piano, arranjador, sintetizador e controlador MIDI',
    'Partes do teclado', 'Sons e timbres', 'Como ligar e configurar', 'Como escolher o primeiro teclado',
  ]),
  makeModule(2, 'Postura e mecânica', [
    'Postura sentada', 'Altura do banco', 'Posição das mãos e dos dedos', 'Numeração dos dedos',
    'Relaxamento de pulso e braço', 'Como evitar tensão e lesões',
  ]),
  makeModule(3, 'Geografia do teclado', [
    'Teclas brancas e pretas', 'Notas naturais', 'Sustenidos e bemóis', 'Oitavas', 'Dó central',
    'Encontrar qualquer nota rapidamente',
  ]),
  makeModule(4, 'Ritmo básico', [
    'Pulsação e metrônomo', 'Figuras rítmicas', 'Pausas', 'Compassos 2/4, 3/4 e 4/4',
    'Tempo forte e fraco', 'Ponto de aumento e ligadura',
  ]),
  makeModule(5, 'Primeiras músicas', [
    'Melodias com uma, duas e três notas', 'Tocar com a mão direita sozinha',
    'Tocar com a mão esquerda sozinha', 'Primeira música com as duas mãos',
    'Músicas folclóricas simples',
  ]),
];

const levelTwoModules = [
  makeModule(6, 'Leitura de partitura', [
    'Pauta e claves de sol e fá', 'Notas na pauta', 'Leitura em Dó central', 'Armadura de clave',
    'Sinais de repetição', 'Leitura em grande pauta',
  ]),
  makeModule(7, 'Cifras e leitura prática', [
    'Como ler cifras', 'Cifra com letras', 'Cifra com diagrama de teclas', 'Tablatura de teclado',
    'Ler e tocar em tempo real',
  ]),
  makeModule(8, 'Escalas', [
    'Tom e semitom', 'Escala de Dó maior', 'Fórmula das escalas maiores', 'Todas as escalas maiores',
    'Digitação das escalas', 'Escala menor natural, harmônica e melódica', 'Escalas relativas',
    'Círculo das quintas',
  ]),
  makeModule(9, 'Intervalos', [
    'Intervalos melódicos e harmônicos',
    'Classificação: maior, menor, justo, aumentado e diminuto',
    'Treino auditivo de intervalos', 'Inversão de intervalos',
  ]),
  makeModule(10, 'Acordes (tríades)', [
    'Tríade maior', 'Tríade menor', 'Tríade diminuta', 'Tríade aumentada', 'Inversões de tríades',
    'Acordes com as duas mãos', 'Trocas de acorde suaves', 'Acordes suspensos: sus2 e sus4',
  ]),
];

const levelThreeModules = [
  makeModule(11, 'Campo harmônico', ['Campo harmônico maior e menor', 'Graus e funções: tônica, subdominante e dominante', 'Progressão I–IV–V', 'Progressão I–V–vi–IV', 'Progressão vi–IV–I–V', 'Identificar o tom de uma música', 'Transposição']),
  makeModule(12, 'Acordes com 7ª', ['Sétima maior', 'Sétima menor', 'Acorde dominante com sétima', 'Acordes meio-diminutos e diminutos', 'Inversões de acordes com 7ª', 'Progressão ii–V–I']),
  makeModule(13, 'Extensões e acordes avançados', ['Extensões de 9ª, 11ª e 13ª', 'Acordes alterados', 'Acordes com baixo (slash chords)', 'Acordes emprestados', 'Dominantes secundários', 'Modulação']),
  makeModule(14, 'Acompanhamento', ['Padrões de mão esquerda: baixo, oitavas, quinta e arpejo', 'Mão esquerda com pulsação', 'Acompanhamento em blocos', 'Acompanhar cantor ou banda', 'Condução de vozes (voice leading)']),
  makeModule(15, 'Técnica pianística', ['Independência das mãos', 'Arpejos', 'Trinados e ornamentos', 'Passagem do polegar', 'Dinâmica: piano e forte', 'Articulação: legato e staccato', 'Uso do pedal', 'Exercícios Hanon e Czerny']),
];

const levelFourModules = [
  makeModule(16, 'Música popular brasileira', ['Baião e forró', 'MPB', 'Bossa nova', 'Samba', 'Sertanejo', 'Pagode', 'Harmonia típica de cada estilo']),
  makeModule(17, 'Pop, rock e gospel', ['Pop moderno', 'Baladas', 'Rock', 'Worship e louvor', 'Gospel: preenchimentos e passing chords']),
  makeModule(18, 'Jazz e blues', ['Blues de 12 compassos', 'Escala de blues', 'Swing e shuffle', 'Voicings de jazz', 'Standards de jazz']),
  makeModule(19, 'Teclado arranjador e sintetizador', ['Ritmos e variações no arranjador', 'Programar e salvar timbres', 'Camadas (layers) e divisões (splits)', 'Síntese: oscilador, filtro e envelope', 'Uso de MIDI']),
];

const levelFiveModules = [
  makeModule(20, 'Improvisação', ['Escalas pentatônicas', 'Escalas de blues', 'Improvisar com poucas notas', 'Frases e motivos', 'Modos gregos', 'Improvisar sobre progressões', 'Construção de solos']),
  makeModule(21, 'Composição e arranjo', ['Criar melodias', 'Harmonizar uma melodia', 'Estrutura: verso, refrão e ponte', 'Rearmonização', 'Escrever arranjos para banda', 'Noções de produção musical']),
  makeModule(22, 'Percepção musical (ouvido)', ['Tirar música de ouvido', 'Reconhecer acordes de ouvido', 'Ouvido relativo', 'Transcrever solos']),
];

const levelSixModules = [
  makeModule(23, 'Estudo eficiente', ['Montar uma rotina diária', 'Estudar com metrônomo', 'Memorizar músicas', 'Lidar com platôs e frustração', 'Metas por semana e por mês']),
  makeModule(24, 'Palco e carreira', ['Tocar em público', 'Vencer o nervosismo', 'Tocar em igreja, banda ou eventos', 'Gravar e publicar suas músicas', 'Equipamentos: cabos, amplificação e interface de áudio']),
];

export const levels: CourseLevel[] = [
  { id: 'n1', number: 1, title: 'Fundamentos', subtitle: 'Comece do zero e faça amizade com o teclado.', color: '#3d7958', modules: levelOneModules },
  { id: 'n2', number: 2, title: 'Teoria e leitura', subtitle: 'Entenda notas, escalas, intervalos e acordes.', color: '#4c739f', modules: levelTwoModules },
  { id: 'n3', number: 3, title: 'Harmonia e acompanhamento', subtitle: 'Conecte acordes e sustente uma música.', color: '#8168aa', modules: levelThreeModules },
  { id: 'n4', number: 4, title: 'Estilos e ritmos', subtitle: 'Leve o teclado para diferentes sonoridades.', color: '#bc843e', modules: levelFourModules },
  { id: 'n5', number: 5, title: 'Criação e performance', subtitle: 'Transforme ideias em improvisos e arranjos.', color: '#bd6c71', modules: levelFiveModules },
  { id: 'n6', number: 6, title: 'Prática e carreira', subtitle: 'Construa uma rotina e toque para outras pessoas.', color: '#ae6546', modules: levelSixModules },
];

export const allModules = levels.flatMap((level) => level.modules.map((courseModule) => ({ ...courseModule, level })));
export const allTopics = allModules.flatMap((courseModule) => courseModule.topics.map((topic) => ({ ...topic, module: courseModule, level: courseModule.level })));
export const findTopic = (id: string) => allTopics.find((topic) => topic.id === id);
export const findModule = (id: string) => allModules.find((courseModule) => courseModule.id === id);
export const levelForModuleNumber = (number: number) => levels.find((level) => level.modules.some((m) => m.number === number));
export const contentReady = (moduleNumber: number) => moduleNumber <= 15;
export const moduleProgressIds = (module: CourseModule) => module.topics.map((topic) => topic.id);
