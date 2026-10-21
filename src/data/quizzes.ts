import { allModules, type CourseModule } from './curriculum';

export type QuizQuestion = { prompt: string; options: string[]; answer: number; explanation: string };

const bank: Record<string, QuizQuestion[]> = {
  'n1-m1': [
    { prompt: 'Qual instrumento normalmente precisa de um computador ou módulo de som para produzir áudio?', options: ['Controlador MIDI', 'Piano digital', 'Teclado arranjador', 'Órgão acústico'], answer: 0, explanation: 'O controlador MIDI envia informações de notas; o som vem de um software ou módulo.' },
    { prompt: 'O que muda quando você toca a mesma nota com piano e órgão?', options: ['O timbre', 'O nome da nota', 'A oitava automaticamente', 'A tecla física'], answer: 0, explanation: 'Timbre é a cor do som. A altura e o nome da nota permanecem iguais.' },
    { prompt: 'Qual é uma boa primeira verificação ao ligar o instrumento?', options: ['Começar com volume baixo', 'Conectar um cabo desconhecido', 'Aumentar o volume ao máximo', 'Pressionar todas as teclas'], answer: 0, explanation: 'Começar baixo protege a audição e evita um som inesperado.' },
  ],
  'n1-m2': [
    { prompt: 'Como os antebraços devem ficar em relação às teclas?', options: ['Próximos do nível das teclas', 'Muito acima dos ombros', 'Com os pulsos dobrados para baixo', 'Sem apoio dos pés em qualquer caso'], answer: 0, explanation: 'Uma altura adequada deixa braços e ombros mais relaxados.' },
    { prompt: 'Qual dedo recebe o número 1?', options: ['Polegar', 'Indicador', 'Médio', 'Mínimo'], answer: 0, explanation: 'O polegar é o dedo 1 nas duas mãos.' },
    { prompt: 'O que fazer se sentir dor ou formigamento?', options: ['Parar e ajustar a prática', 'Tocar mais forte', 'Acelerar o exercício', 'Ignorar o sinal'], answer: 0, explanation: 'Dor ou formigamento pede pausa e ajuste, não insistência.' },
  ],
  'n1-m3': [
    { prompt: 'Onde fica o Dó em relação a um grupo de duas teclas pretas?', options: ['Imediatamente à esquerda', 'Entre as duas pretas', 'Imediatamente à direita', 'Duas teclas depois'], answer: 0, explanation: 'O Dó fica à esquerda do grupo de duas pretas.' },
    { prompt: 'Quantas notas naturais há antes de a sequência recomeçar?', options: ['Sete', 'Cinco', 'Oito', 'Doze'], answer: 0, explanation: 'Dó, Ré, Mi, Fá, Sol, Lá e Si formam as sete notas naturais.' },
    { prompt: 'O que faz um sustenido?', options: ['Eleva a nota em um semitom', 'Abaixa a nota em um semitom', 'Dobra a duração', 'Muda o timbre'], answer: 0, explanation: 'O sustenido eleva a nota em um semitom.' },
  ],
  'n1-m4': [
    { prompt: 'Para que serve a pulsação?', options: ['Manter uma batida regular de referência', 'Escolher o timbre', 'Nomear as teclas pretas', 'Indicar a altura do banco'], answer: 0, explanation: 'A pulsação organiza o tempo e ajuda a manter estabilidade.' },
    { prompt: 'Em um compasso 3/4, quantos tempos são contados por compasso?', options: ['Três', 'Dois', 'Quatro', 'Seis'], answer: 0, explanation: 'O número de cima indica três tempos por compasso.' },
    { prompt: 'O que acontece durante uma pausa?', options: ['O silêncio também é contado', 'A pulsação para', 'O compasso é ignorado', 'A nota seguinte começa antes'], answer: 0, explanation: 'A música continua contando durante o silêncio.' },
  ],
  'n1-m5': [
    { prompt: 'Qual é uma boa estratégia para começar a juntar as mãos?', options: ['Praticar cada mão separada e depois combinar devagar', 'Aumentar o andamento logo no início', 'Tocar acordes complexos com a esquerda', 'Pular a contagem'], answer: 0, explanation: 'Mãos separadas ajudam a aprender cada parte antes de coordená-las.' },
    { prompt: 'O que ajuda a tocar uma melodia curta com segurança?', options: ['Dividir em pequenos trechos', 'Tocar sem ouvir a pulsação', 'Mudar de posição a cada nota', 'Começar o mais rápido possível'], answer: 0, explanation: 'Trechos pequenos deixam mais fácil observar notas, ritmo e movimento.' },
    { prompt: 'Como a mão esquerda deve praticar no começo?', options: ['Com padrões simples em região confortável', 'Sempre com acordes muito graves', 'Com o pulso preso', 'Sem contar os tempos'], answer: 0, explanation: 'Simplicidade e conforto deixam a atenção livre para o tempo.' },
  ],
  'n2-m6': [
    { prompt: 'Quantas linhas tem a pauta?', options: ['Cinco', 'Quatro', 'Seis', 'Sete'], answer: 0, explanation: 'A pauta tradicional tem cinco linhas e quatro espaços.' },
    { prompt: 'O que a clave define?', options: ['A referência das notas na pauta', 'O volume do teclado', 'O BPM da música', 'O tipo de pedal'], answer: 0, explanation: 'A clave estabelece a referência para identificar notas escritas.' },
    { prompt: 'Para que serve uma armadura de clave?', options: ['Indicar alterações recorrentes', 'Mudar o timbre', 'Marcar o volume', 'Apagar as pausas'], answer: 0, explanation: 'A armadura mostra sustenidos ou bemóis que se aplicam na música.' },
  ],
  'n2-m7': [
    { prompt: 'O que representa a letra C em uma cifra?', options: ['A nota Dó como fundamental', 'Uma clave de dó', 'Um compasso de quatro tempos', 'Um timbre de cordas'], answer: 0, explanation: 'As letras A–G representam as notas Lá–Sol; C é Dó.' },
    { prompt: 'O que costuma indicar o símbolo “m” após a letra da cifra?', options: ['Acorde menor', 'Acorde aumentado', 'Mão esquerda', 'Mudança de compasso'], answer: 0, explanation: 'Em cifras, C e Cm distinguem Dó maior e Dó menor.' },
    { prompt: 'A cifra, sozinha, sempre informa o ritmo exato?', options: ['Não, ela indica principalmente a harmonia', 'Sim, informa todos os ataques', 'Sim, substitui qualquer gravação', 'Não, indica apenas o andamento'], answer: 0, explanation: 'A cifra indica o acorde; o ritmo depende da partitura, gravação ou arranjo.' },
  ],
  'n2-m8': [
    { prompt: 'Quantos semitons formam um tom?', options: ['Dois', 'Um', 'Três', 'Quatro'], answer: 0, explanation: 'Um tom equivale a dois semitons.' },
    { prompt: 'Qual é a fórmula da escala maior?', options: ['T–T–S–T–T–T–S', 'T–S–T–T–S–T–T', 'S–T–T–S–T–T–T', 'T–T–T–S–T–S–T'], answer: 0, explanation: 'A escala maior usa tons e semitons nesta ordem: T–T–S–T–T–T–S.' },
    { prompt: 'Qual nota é relativa menor de Dó maior?', options: ['Lá', 'Mi', 'Sol', 'Ré'], answer: 0, explanation: 'Dó maior e Lá menor compartilham as mesmas notas naturais.' },
  ],
  'n2-m9': [
    { prompt: 'Quando duas notas soam ao mesmo tempo, o intervalo é...', options: ['Harmônico', 'Melódico', 'Rítmico', 'Pontuado'], answer: 0, explanation: 'Intervalo harmônico é ouvido simultaneamente; melódico, em sequência.' },
    { prompt: 'Ao inverter um intervalo, os números das duas posições somam...', options: ['Nove', 'Sete', 'Oito', 'Doze'], answer: 0, explanation: 'Por exemplo, terça e sexta somam nove.' },
    { prompt: 'Qual intervalo é formado por Dó e Mi?', options: ['Terça', 'Segunda', 'Quinta', 'Sétima'], answer: 0, explanation: 'Dó–Ré–Mi abrange três nomes de notas: uma terça.' },
  ],
  'n2-m10': [
    { prompt: 'Quais notas formam a tríade de Dó maior?', options: ['Dó–Mi–Sol', 'Dó–Mi bemol–Sol', 'Dó–Ré–Sol', 'Dó–Fá–Sol'], answer: 0, explanation: 'Uma tríade maior tem fundamental, terça maior e quinta justa.' },
    { prompt: 'O que muda na inversão de um acorde?', options: ['A nota que fica no baixo', 'A coleção de notas obrigatoriamente', 'A tonalidade da música', 'O número de teclas do instrumento'], answer: 0, explanation: 'Inverter redistribui as mesmas notas e altera qual fica no baixo.' },
    { prompt: 'O que a terça faz em um acorde sus2?', options: ['É substituída pela segunda', 'É substituída pela quinta', 'É dobrada', 'Vira a fundamental'], answer: 0, explanation: 'Sus2 usa segunda no lugar da terça.' },
  ],
};

const distractorPool = allModules.flatMap((m) => m.topics.map((topic) => topic.title));
const makeOrientationQuiz = (courseModule: CourseModule): QuizQuestion[] => {
  const optionsFor = (correct: string, offset: number) => {
    const distractors = distractorPool.filter((item) => !courseModule.topics.some((topic) => topic.title === item) && item !== correct).slice(offset, offset + 3);
    const options = [correct, ...distractors];
    return options.length >= 4 ? options : [...options, 'Outro tema musical'];
  };
  const first = courseModule.topics[0]?.title ?? courseModule.title;
  const second = courseModule.topics[1]?.title ?? first;
  return [
    { prompt: `Qual destes temas faz parte de “${courseModule.title}”?`, options: optionsFor(first, 0), answer: 0, explanation: `“${first}” aparece na estrutura deste módulo. O conteúdo detalhado será desenvolvido depois.` },
    { prompt: `Qual tópico você encontrará neste módulo?`, options: optionsFor(second, 3), answer: 0, explanation: `“${second}” está listado neste módulo. Este quiz serve como orientação, não como prova de domínio.` },
  ];
};

export const quizFor = (moduleId: string): QuizQuestion[] => {
  const courseModule = allModules.find((item) => item.id === moduleId);
  if (!courseModule) return [];
  const questions = bank[moduleId] ?? makeOrientationQuiz(courseModule);
  const seed = [...moduleId].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return questions.map((question, index) => {
    const offset = (seed + index) % question.options.length;
    return {
      ...question,
      options: [...question.options.slice(offset), ...question.options.slice(0, offset)],
      answer: (question.answer - offset + question.options.length) % question.options.length,
    };
  });
};
export const quizIsIntroductory = (moduleId: string) => !bank[moduleId];
