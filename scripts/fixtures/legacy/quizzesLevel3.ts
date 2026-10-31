import type { QuizQuestion } from './quizzes';

export const quizzesLevel3: Record<string, QuizQuestion[]> = {
  'n3-m11': [
    { prompt: 'Qual sequência corresponde ao campo harmônico diatônico de Dó maior?', options: ['C, Dm, Em, F, G, Am, Bdim', 'C, D, E, F, G, A, B', 'Cm, Dm, Eb, Fm, Gm, Ab, Bb', 'C, Em, F#m, G, Am, Bm, C#dim'], answer: 0, explanation: 'Empilhando notas alternadas da escala de Dó maior, a sequência de tríades tem essas qualidades.' },
    { prompt: 'Em Dó maior, qual acorde costuma cumprir a função de subdominante no grau IV?', options: ['G', 'Am', 'F', 'Bdim'], answer: 2, explanation: 'F é o acorde do IV grau; ele costuma preparar a harmonia antes do dominante.' },
    { prompt: 'Como se toca I–V–vi–IV em Dó maior?', options: ['C–F–G–C', 'C–G–Am–F', 'Am–F–C–G', 'C–Am–Dm–G'], answer: 1, explanation: 'Os graus I, V, vi e IV em Dó maior são C, G, Am e F.' },
    { prompt: 'Ao transpor C–F–G–C um tom acima, qual sequência mantém as funções?', options: ['D–G–A–D', 'D–A–Bm–G', 'E–A–B–E', 'C–G–Am–F'], answer: 0, explanation: 'Subindo cada acorde um tom, I–IV–V–I vira D–G–A–D.' },
  ],
  'n3-m12': [
    { prompt: 'Quais notas formam Cmaj7?', options: ['C–Eb–G–Bb', 'C–E–G–B', 'C–E–G–Bb', 'C–D–G–B'], answer: 1, explanation: 'Cmaj7 tem fundamental, terça maior, quinta justa e sétima maior.' },
    { prompt: 'Qual movimento costuma resolver G7 em C?', options: ['Si sobe a Dó e Fá desce a Mi', 'Sol sobe a Lá e Ré desce a Dó', 'Si desce a Lá e Fá sobe a Sol', 'Todas as notas ficam paradas'], answer: 0, explanation: 'As notas guia do dominante tendem a mover-se por semitom para notas do acorde de Dó.' },
    { prompt: 'Qual conjunto forma Bm7(b5)?', options: ['Si–Ré–Fá–Lá', 'Si–Ré–Fá–Lá bemol', 'Si–Ré sustenido–Fá sustenido–Lá', 'Si–Ré–Fá sustenido–Lá'], answer: 0, explanation: 'O meio-diminuto tem terça menor, quinta diminuta e sétima menor.' },
    { prompt: 'Qual é ii–V–I em Sol maior?', options: ['Gm7–C7–Fmaj7', 'Am7–D7–Gmaj7', 'Bm7–E7–Amaj7', 'Dm7–G7–Cmaj7'], answer: 1, explanation: 'Em Sol maior, o segundo grau é Am7, o quinto é D7 e a tônica pode ser Gmaj7.' },
  ],
  'n3-m13': [
    { prompt: 'O que indica a cifra C/E?', options: ['Acorde de C com Mi como nota mais grave', 'Acorde de E menor com Dó no baixo', 'Acorde de C com a terça omitida', 'Duas tríades tocadas simultaneamente'], answer: 0, explanation: 'Antes da barra está o acorde; depois dela, a nota que deve ficar no baixo.' },
    { prompt: 'Qual acorde pode ser emprestado de Dó menor para uma música em Dó maior?', options: ['Fá menor', 'Sol maior', 'Dó maior', 'Ré menor'], answer: 0, explanation: 'Fm contém Lá bemol, uma cor emprestada do modo paralelo de Dó menor.' },
    { prompt: 'Em Dó maior, D7 costuma funcionar como dominante secundário de qual acorde?', options: ['Am', 'F', 'G', 'C'], answer: 2, explanation: 'D7 é V7 de G e pode preparar a chegada ao acorde de Sol.' },
    { prompt: 'Qual nota é a 9ª em Cmaj9?', options: ['Mi', 'Ré', 'Si', 'Fá'], answer: 1, explanation: 'A 9ª de Dó é Ré, a nota correspondente ao segundo grau acima da oitava.' },
  ],
  'n3-m14': [
    { prompt: 'Qual padrão usa fundamental e quinta alternadas sobre o acorde C?', options: ['C–G–C–G', 'C–E–F–G', 'E–F–G–A', 'C–F–A–B'], answer: 0, explanation: 'C é a fundamental e G é a quinta justa do acorde.' },
    { prompt: 'Ao acompanhar uma pessoa cantando, o que ajuda a deixar a voz clara?', options: ['Preencher cada pausa com muitas notas', 'Tocar sempre no volume máximo', 'Ouvir a voz e deixar espaço na textura', 'Mudar a tonalidade sem combinar'], answer: 2, explanation: 'Acompanhamento apoia a melodia; volume e quantidade de notas devem deixar a voz audível.' },
    { prompt: 'O que é um acompanhamento em blocos?', options: ['Tocar as notas do acorde ao mesmo tempo', 'Tocar cada nota do acorde uma por vez', 'Tocar apenas a fundamental', 'Sustentar o pedal sem trocar'], answer: 0, explanation: 'Acordes em bloco são ataques simultâneos das notas do acorde.' },
    { prompt: 'O que favorece uma condução suave entre C, G/B e Am?', options: ['Saltar para a mesma posição fundamental em cada acorde', 'Manter notas comuns e mover as demais pouco', 'Tocar cada acorde em oitavas diferentes sem ouvir', 'Aumentar a velocidade a cada troca'], answer: 1, explanation: 'Voice leading busca conexões próximas entre as vozes dos acordes.' },
  ],
  'n3-m15': [
    { prompt: 'Qual estratégia ajuda a desenvolver coordenação entre as mãos?', options: ['Acelerar desde a primeira tentativa', 'Tocar só com força', 'Praticar cada parte separada e combinar devagar', 'Manter o pulso preso'], answer: 2, explanation: 'Separar as partes e combiná-las gradualmente reduz a carga de coordenação.' },
    { prompt: 'Qual é a diferença básica entre legato e staccato?', options: ['Legato é forte; staccato é piano', 'Legato conecta; staccato separa as notas', 'Legato usa pedal; staccato usa metrônomo', 'Não há diferença de articulação'], answer: 1, explanation: 'Legato busca continuidade; staccato encurta e separa os sons.' },
    { prompt: 'Quando é útil trocar o pedal sustain?', options: ['Só no fim de toda música', 'A cada tecla, antes de tocar', 'Nunca; o pedal deve ficar sempre abaixado', 'Quando a harmonia muda, para evitar mistura excessiva'], answer: 3, explanation: 'Limpar ou renovar o pedal na troca harmônica ajuda a manter os acordes definidos.' },
    { prompt: 'Como praticar um estudo de Hanon ou Czerny com cuidado?', options: ['O mais rápido possível, ignorando tensão', 'Devagar, por trecho curto, com objetivo e sem dor', 'Repetindo por horas sem pausa', 'Sem escutar regularidade'], answer: 1, explanation: 'Estudos servem a objetivos técnicos e devem ser praticados com controle, não à custa de dor.' },
  ],
};
