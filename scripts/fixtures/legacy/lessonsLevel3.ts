import type { Lesson } from './lessons';

const lesson = (explanation: string, example: string, exercises: string[], checklist: string[], highlight: string[]): Lesson => ({ explanation, example, exercises, checklist, highlight });

export const lessonsLevel3: Record<string, Lesson> = {
  'n3-m11-t1': lesson(
    'Campo harmônico é o conjunto de acordes formados com as notas de uma escala, empilhando notas alternadas. No campo maior, a sequência básica é maior, menor, menor, maior, maior, menor e diminuto. O campo menor natural tem outra ordem de qualidades.',
    'Em Dó maior: C, Dm, Em, F, G, Am e Bdim. Em Lá menor natural: Am, Bdim, C, Dm, Em, F e G.',
    ['Monte as tríades do campo de Dó maior, usando apenas notas naturais.', 'Encontre o campo de Lá menor natural e compare os acordes com Dó maior.'],
    ['Consigo formar cada acorde usando notas alternadas da escala.', 'Reconheço a sequência de qualidades no campo maior.'],
    ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']
  ),
  'n3-m11-t2': lesson(
    'Os graus descrevem a posição do acorde dentro do tom. As funções resumem o papel que ele costuma cumprir: tônica soa como repouso; subdominante prepara movimento; dominante cria tensão que frequentemente resolve na tônica. A função depende do contexto, não apenas do nome do acorde.',
    'Em Dó maior, C (I) é tônica, F (IV) é subdominante e G ou G7 (V) é dominante, com tendência a voltar para C.',
    ['Toque C–F–G–C e diga “repouso, preparação, tensão, repouso”.', 'Identifique I, IV e V em Sol maior: G, C e D.'],
    ['Sei localizar I, IV e V dentro de uma tonalidade.', 'Consigo ouvir a tensão do V e a resolução em I.'],
    ['Dó', 'Mi', 'Sol', 'Fá', 'Lá', 'Si', 'Ré']
  ),
  'n3-m11-t3': lesson(
    'A progressão I–IV–V usa os acordes construídos sobre o primeiro, quarto e quinto graus da escala. Ela cria uma sensação clara de saída, tensão e retorno, e aparece em muitos estilos. Conte os compassos para que a resolução chegue no momento certo.',
    'Em Dó maior, I–IV–V–I é C–F–G–C. Experimente um acorde por compasso em 4/4.',
    ['Toque C–F–G–C com quatro tempos em cada acorde.', 'Transponha o padrão para Sol maior: G–C–D–G.'],
    ['Encontro os graus I, IV e V sem contar acordes aleatórios.', 'Mantenho o pulso durante a progressão.'],
    ['Dó', 'Mi', 'Sol', 'Fá', 'Lá', 'Si', 'Ré']
  ),
  'n3-m11-t4': lesson(
    'I–V–vi–IV é uma progressão de quatro acordes comum na música pop. O acorde vi é menor e acrescenta contraste antes de a harmonia voltar ao IV. Os números romanos indicam graus, então a fórmula pode ser transportada para outros tons.',
    'Em Dó maior, I–V–vi–IV é C–G–Am–F. Cante a sequência enquanto toca um acorde por compasso.',
    ['Toque C–G–Am–F e repita sem parar entre os acordes.', 'Em Ré maior, monte a mesma fórmula: D–A–Bm–G.'],
    ['Reconheço o vi menor na fórmula.', 'Consigo transportar a sequência mantendo a mesma ordem de graus.'],
    ['Dó', 'Mi', 'Sol', 'Ré', 'Sol', 'Si', 'Lá', 'Fá']
  ),
  'n3-m11-t5': lesson(
    'vi–IV–I–V usa os mesmos graus de I–V–vi–IV, mas começa pelo vi. Mudar o ponto de partida altera a sensação da frase: ela pode soar mais introspectiva antes de chegar ao acorde de repouso. A função de cada acorde continua ligada à tonalidade.',
    'Em Dó maior, vi–IV–I–V é Am–F–C–G. Compare o início em Am com o início em C.',
    ['Toque Am–F–C–G em andamento lento e cante a nota fundamental de cada acorde.', 'Alterne quatro compassos de C–G–Am–F com quatro de Am–F–C–G.'],
    ['Identifico o vi como Lá menor em Dó maior.', 'Percebo como o ponto de partida muda o caráter sem mudar a tonalidade.'],
    ['Lá', 'Dó', 'Mi', 'Fá', 'Sol', 'Dó', 'Mi', 'Si']
  ),
  'n3-m11-t6': lesson(
    'Para estimar o tom de uma música, observe onde a harmonia parece repousar, qual nota aparece com frequência no baixo e qual acorde encerra frases. Confira se as notas da melodia combinam com a escala candidata. Algumas músicas mudam de tom, então trate a conclusão como hipótese a confirmar.',
    'Se uma música usa C, F e G e termina repetidamente em C, Dó maior é uma hipótese forte. A nota final da melodia pode ajudar a confirmar.',
    ['Escolha uma música simples, anote seus acordes e procure o acorde de repouso.', 'Cante a nota que soa final e compare-a com a fundamental do acorde de encerramento.'],
    ['Uso mais de uma pista para sugerir a tonalidade.', 'Sei que uma música pode conter empréstimos ou mudar de tom.'],
    ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']
  ),
  'n3-m11-t7': lesson(
    'Transpor é levar uma melodia ou progressão para outra tonalidade mantendo as mesmas distâncias entre notas. Desloque todas as fundamentais pelo mesmo intervalo e reconstrua a qualidade dos acordes; não basta mover somente a mão para uma região diferente.',
    'C–G–Am–F, transposta de Dó para Ré maior, vira D–A–Bm–G: cada acorde subiu um tom.',
    ['Transponha C–F–G–C para Ré maior: D–G–A–D.', 'Toque uma melodia curta em Dó e depois em Ré, conferindo os intervalos.'],
    ['Mantenho a mesma ordem e qualidade dos acordes.', 'Sei localizar as notas alteradas que surgem na nova tonalidade.'],
    ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si', 'Dó sustenido', 'Fá sustenido']
  ),

  'n3-m12-t1': lesson(
    'Acorde com sétima maior reúne fundamental, terça maior, quinta justa e sétima maior. Em cifra, pode aparecer como maj7 ou 7M. A sétima maior fica um semitom abaixo da oitava da fundamental e dá uma cor mais aberta que a tríade simples.',
    'Cmaj7 é Dó–Mi–Sol–Si. Toque a tríade C e acrescente Si para ouvir a diferença.',
    ['Monte Cmaj7 e depois Gmaj7, nomeando as quatro notas.', 'Alterne C e Cmaj7 sem mudar a fundamental e compare a cor.'],
    ['Monto o acorde com sétima maior pela fórmula 1–3–5–7.', 'Distingo maj7 de acorde dominante com sétima.'],
    ['Dó', 'Mi', 'Sol', 'Si']
  ),
  'n3-m12-t2': lesson(
    'Acorde menor com sétima combina tríade menor e sétima menor: fundamental, terça menor, quinta justa e sétima menor. A cifra costuma usar m7. É muito usado como acorde de ii ou vi em acompanhamentos.',
    'Am7 é Lá–Dó–Mi–Sol. Compare com A7: a terça e a sétima são diferentes.',
    ['Construa Am7 e Dm7 tocando as notas juntas e depois como arpejo.', 'Compare Am, Am7 e A7 e descreva qual nota muda em cada caso.'],
    ['Identifico as quatro notas de uma tríade menor com sétima.', 'Leio corretamente o “m” minúsculo antes de 7 na cifra.'],
    ['Lá', 'Dó', 'Mi', 'Sol', 'Ré', 'Fá']
  ),
  'n3-m12-t3': lesson(
    'Acorde dominante com sétima contém fundamental, terça maior, quinta justa e sétima menor. A combinação da terça com a sétima cria tensão que costuma resolver no acorde cuja fundamental está uma quarta acima. Em cifra, aparece apenas como 7, por exemplo G7.',
    'G7 (Sol–Si–Ré–Fá) tende a resolver em C: Si sobe para Dó e Fá desce para Mi.',
    ['Toque G7 e resolva em C, ouvindo o movimento Si–Dó e Fá–Mi.', 'Monte D7 e encontre um acorde para o qual ele possa resolver com força.'],
    ['Monto o dominante 7 com terça maior e sétima menor.', 'Reconheço uma resolução possível sem confundir 7 com maj7.'],
    ['Sol', 'Si', 'Ré', 'Fá', 'Dó', 'Mi']
  ),
  'n3-m12-t4': lesson(
    'O meio-diminuto tem fórmula 1–b3–b5–b7 e cifra m7(b5). O diminuto com sétima usa 1–b3–b5–bb7, muitas vezes escrito dim7 ou °7. As duas qualidades compartilham a quinta diminuta, mas a última nota é diferente.',
    'Bm7(b5) é Si–Ré–Fá–Lá; Bdim7 é Si–Ré–Fá–Lá bemol (a mesma tecla que Sol sustenido no teclado).',
    ['Monte Bm7(b5) e Bdim7; compare apenas a última nota.', 'Toque Bdim7 e observe como sua simetria permite inverter as notas em intervalos de terça menor.'],
    ['Distingo m7(b5) de dim7 pela sétima.', 'Identifico a terça menor e a quinta diminuta nos dois acordes.'],
    ['Si', 'Ré', 'Fá', 'Lá', 'Sol sustenido']
  ),
  'n3-m12-t5': lesson(
    'Um acorde com sétima tem quatro posições: fundamental, primeira, segunda e terceira inversão. Cada inversão coloca uma nota diferente no baixo, mas mantém as mesmas quatro notas. Escolha a posição que aproxima o baixo do acorde seguinte.',
    'Cmaj7 em posição fundamental é C–E–G–B; primeira inversão é E–G–B–C.',
    ['Toque as quatro inversões de Cmaj7, dizendo qual nota está no baixo.', 'Ligue Cmaj7 a Fmaj7 escolhendo a inversão que move menos a mão.'],
    ['Reconheço quatro posições sem trocar as notas do acorde.', 'Consigo escolher uma inversão pela nota do baixo.'],
    ['Dó', 'Mi', 'Sol', 'Si', 'Fá', 'Lá']
  ),
  'n3-m12-t6': lesson(
    'ii–V–I é uma sequência central da harmonia tonal: o acorde do segundo grau prepara o dominante, que resolve na tônica. O ii é normalmente menor com sétima e o V é dominante com sétima. Pratique primeiro em um tom e depois transporte a fórmula.',
    'Em Dó maior: Dm7–G7–Cmaj7. A condução Si–Dó e Fá–Mi ajuda a ouvir a resolução.',
    ['Toque Dm7–G7–Cmaj7 em quatro tempos por acorde.', 'Transponha ii–V–I para Sol maior: Am7–D7–Gmaj7.'],
    ['Encontro ii, V e I dentro da tonalidade.', 'Ouço a tensão do dominante e a resolução na tônica.'],
    ['Ré', 'Fá', 'Lá', 'Dó', 'Sol', 'Si', 'Mi']
  ),

  'n3-m13-t1': lesson(
    'As extensões 9ª, 11ª e 13ª nomeiam notas acima da oitava da fundamental. Elas ampliam a cor dos acordes com sétima; em uma abertura prática, pode-se omitir ou redistribuir notas para evitar excesso de graves e som embolado.',
    'Cmaj9 reúne C–E–G–B–D. A nota Ré é a 9ª de Dó. Uma sonoridade C13 também pode incluir Lá como 13ª.',
    ['Toque Cmaj7 e acrescente Ré como 9ª.', 'Experimente uma abertura sem a quinta no registro grave e compare a clareza.'],
    ['Sei por que 9ª é o nome da nota equivalente ao segundo grau acima da oitava.', 'Consigo acrescentar uma extensão sem deixar o acorde confuso.'],
    ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']
  ),
  'n3-m13-t2': lesson(
    'Acordes alterados modificam uma ou mais tensões ou notas do dominante, por exemplo b9, #9, b5 ou #5. A alteração cria uma cor específica e uma expectativa de resolução; não é uma regra para alterar qualquer nota aleatoriamente.',
    'G7(b9) acrescenta Lá bemol à sonoridade de G7 e pode resolver em C. O Lá bemol pode ser tocado como Sol sustenido no teclado temperado.',
    ['Compare G7 e G7(b9), resolvendo os dois em C.', 'Escolha uma tensão alterada e descreva como ela se move ao resolver.'],
    ['Leio o símbolo da alteração antes de montar o acorde.', 'Relaciono a tensão ao acorde de resolução.'],
    ['Sol', 'Si', 'Ré', 'Fá', 'Sol sustenido', 'Dó', 'Mi']
  ),
  'n3-m13-t3': lesson(
    'Na cifra com barra, a letra antes da barra indica o acorde e a letra depois indica a nota mais grave. Quando o baixo é uma nota do próprio acorde, a forma costuma ser uma inversão; se não for, o baixo acrescenta outro efeito harmônico.',
    'C/E significa acorde de Dó maior com Mi no baixo. D/F# indica Ré maior com Fá sustenido no baixo.',
    ['Toque C, depois C/E, mantendo Dó–Mi–Sol na mão direita.', 'Leia G/B e diga qual acorde tocar e qual nota colocar no baixo.'],
    ['Interpreto separadamente acorde e nota do baixo.', 'Sei que nem todo slash chord é uma inversão simples.'],
    ['Dó', 'Mi', 'Sol', 'Ré', 'Fá sustenido', 'Lá', 'Si']
  ),
  'n3-m13-t4': lesson(
    'Acorde emprestado vem temporariamente da tonalidade paralela, com a mesma tônica e modo diferente. Ele introduz uma cor sem exigir mudança definitiva de tonalidade. Ouça a nota alterada e observe para onde o acorde se move.',
    'Em Dó maior, Fm (Fá–Lá bemol–Dó) pode ser emprestado de Dó menor e resolver de volta em C.',
    ['Alterne C–Fm–C e cante a nota Lá bemol.', 'Compare Fm com F maior e identifique a terça que mudou.'],
    ['Entendo “paralela” como mesma tônica e modo diferente.', 'Reconheço a nota alterada no acorde emprestado.'],
    ['Dó', 'Mi', 'Fá', 'Sol', 'Sol sustenido']
  ),
  'n3-m13-t5': lesson(
    'Dominante secundário é o acorde V7 de um grau diferente da tônica principal. Ele cria uma atração local para esse acorde, sem necessariamente mudar o tom da música. A cifra costuma ser lida como “cinco de” o acorde-alvo.',
    'Em Dó maior, D7 é V7/V e tende a resolver em G. A7 pode funcionar como V7/ii e resolver em Dm.',
    ['Toque D7–G e observe Fá sustenido subindo para Sol.', 'Em Dó maior, encontre o dominante secundário que prepara Am e toque a resolução.'],
    ['Identifico qual acorde é o alvo da dominante secundária.', 'Distingo uma resolução local de uma modulação completa.'],
    ['Ré', 'Fá sustenido', 'Lá', 'Dó', 'Sol', 'Dó sustenido', 'Mi']
  ),
  'n3-m13-t6': lesson(
    'Modulação é a mudança perceptível para uma nova tonalidade. Um acorde comum entre os dois tons pode funcionar como ponte; em seguida, uma dominante da nova tonalidade ajuda a firmar o destino. Uma tonicização breve, sozinha, não prova que houve modulação.',
    'Uma passagem possível de Dó maior para Sol maior é C–F–Am–D7–G. D7 prepara G, que passa a soar como novo ponto de repouso.',
    ['Toque C–F–Am–D7–G e sustente G ao final.', 'Compare uma música que permanece no mesmo tom com outra que sobe de tom no refrão.'],
    ['Percebo a nova tônica pelo repouso e pela harmonia que a confirma.', 'Não confundo uma dominante passageira com mudança de tom.'],
    ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']
  ),

  'n3-m14-t1': lesson(
    'A mão esquerda pode tocar a fundamental, oitavas, fundamental e quinta, ou notas de um arpejo. Cada padrão ocupa um espaço e produz uma sensação rítmica diferente. Escolha um que sustente a música sem competir com a melodia.',
    'Sobre C, experimente C–G–C–G como raiz e quinta, ou C–G–E–G como arpejo simples.',
    ['Toque cada padrão sobre C por quatro compassos, com metrônomo lento.', 'Repita a sequência sobre Am e ajuste as notas à nova tríade.'],
    ['Mantenho o padrão regular e relaxado.', 'Escolho notas compatíveis com o acorde e com o registro da música.'],
    ['Dó', 'Mi', 'Sol', 'Lá', 'Ré']
  ),
  'n3-m14-t2': lesson(
    'Uma pulsação simples na mão esquerda dá referência ao tempo. Você pode tocar a fundamental nos tempos 1 e 3, a cada batida, ou alternar baixo e quinta. O padrão deve combinar com o compasso e permanecer estável enquanto a mão direita toca.',
    'Em 4/4, toque C nos tempos 1 e 3 e mantenha a contagem “1, 2, 3, 4” durante uma melodia fácil.',
    ['Marque C nos tempos 1 e 3 por oito compassos a 60 BPM.', 'Mantenha a mesma pulsação enquanto a mão direita toca uma frase curta.'],
    ['Não acelero quando a mão direita começa a melodia.', 'Separo pulsação regular de preenchimentos rítmicos.'],
    ['Dó', 'Mi', 'Sol', 'Fá', 'Lá', 'Ré']
  ),
  'n3-m14-t3': lesson(
    'Acompanhamento em blocos toca as notas do acorde ao mesmo tempo, normalmente em ataques rítmicos combinados com a melodia ou com o canto. Inversões ajudam a reduzir saltos. Comece com um padrão enxuto e acrescente ritmo só quando estiver estável.',
    'Em Dó maior, acompanhe C–F–G–C tocando cada tríade em bloco no primeiro tempo do compasso.',
    ['Toque quatro compassos com um acorde em bloco por compasso.', 'Acrescente um segundo ataque leve sem perder a pulsação.'],
    ['Reconheço quando as notas devem soar juntas.', 'Mantenho os acordes claros e sem força excessiva.'],
    ['Dó', 'Mi', 'Sol', 'Fá', 'Lá', 'Si', 'Ré']
  ),
  'n3-m14-t4': lesson(
    'Ao acompanhar cantor ou banda, ouça o conjunto antes de tocar. Combine tonalidade e andamento, deixe espaço para a melodia e reduza o volume quando outras partes estiverem em destaque. Siga sinais de entrada, final e mudança de seção.',
    'Se a voz canta uma frase longa, experimente sustentar poucos acordes e evitar preencher cada pausa com notas.',
    ['Acompanhe uma gravação simples com acordes longos e escute a voz.', 'Repita a música usando menos notas e observe se a melodia fica mais clara.'],
    ['Escuto a melodia e os demais instrumentos enquanto acompanho.', 'Ajusto densidade e volume em vez de tocar continuamente.'],
    ['Dó', 'Mi', 'Sol', 'Lá', 'Fá', 'Ré']
  ),
  'n3-m14-t5': lesson(
    'Condução de vozes é escolher a posição dos acordes para que cada nota se mova pouco e com intenção. Mantenha notas comuns quando possível e mova as demais por tom ou semitom. Isso cria ligações suaves mesmo quando a fundamental muda bastante.',
    'C (C–E–G) → G/B (B–D–G) → Am (A–C–E): Sol permanece entre os dois primeiros acordes e outras vozes se deslocam pouco.',
    ['Toque C–G/B–Am mantendo a nota Sol quando possível.', 'Compare a posição fundamental C–G–Am com inversões próximas e ouça qual exige menos salto.'],
    ['Identifico notas comuns entre acordes vizinhos.', 'Escolho inversões para criar movimentos menores sem perder a harmonia.'],
    ['Dó', 'Ré', 'Mi', 'Sol', 'Si', 'Lá']
  ),

  'n3-m15-t1': lesson(
    'Independência das mãos não significa rigidez: significa coordenar tarefas diferentes mantendo o corpo relaxado. Primeiro automatize cada parte separada; depois combine um padrão simples na esquerda com uma melodia curta na direita.',
    'A esquerda toca C nos tempos 1 e 3; a direita toca C–D–E em semínimas, contando quatro tempos.',
    ['Pratique cada mão separadamente por um minuto.', 'Combine as mãos em andamento lento; se perder o pulso, volte a separar as partes.'],
    ['Consigo manter o pulso de uma mão enquanto a outra toca.', 'Pratico sem prender o ombro, o punho ou a respiração.'],
    ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']
  ),
  'n3-m15-t2': lesson(
    'Arpejo é tocar as notas de um acorde em sequência, subindo ou descendo. Uma digitação confortável ajuda a manter som uniforme; pratique devagar e use movimento contínuo, sem apertar cada nota com força.',
    'O arpejo de C pode ser C–E–G–C e voltar G–E–C.',
    ['Toque o arpejo de C subindo e descendo em uma oitava.', 'Repita em Am e mantenha a duração das notas regular.'],
    ['Reconheço as notas do acorde dentro do arpejo.', 'Mantenho regularidade e relaxamento ao trocar de direção.'],
    ['Dó', 'Mi', 'Sol', 'Lá']
  ),
  'n3-m15-t3': lesson(
    'Trinado alterna rapidamente uma nota com a vizinha, normalmente indicada pela partitura ou pelo estilo. Mordente e grupeto são ornamentos curtos que decoram a nota principal. A clareza e a intenção importam mais do que a velocidade.',
    'Experimente alternar Ré–Mi algumas vezes em ritmo lento, terminando com a nota principal da melodia.',
    ['Alterne duas notas vizinhas devagar e mantenha o pulso.', 'Inclua um ornamento curto em uma frase conhecida e compare com a versão sem ornamento.'],
    ['Mantenho o movimento pequeno e confortável.', 'Uso o ornamento sem interromper o pulso ou esconder a melodia.'],
    ['Ré', 'Mi', 'Fá', 'Sol']
  ),
  'n3-m15-t4': lesson(
    'Na passagem do polegar, a mão muda de posição para continuar uma escala sem um salto desconfortável. O polegar passa por baixo da mão com um ajuste do braço e do punho; não torça a mão nem force uma articulação.',
    'Na mão direita em Dó maior: toque Dó–Ré–Mi com 1–2–3; desloque a mão com leveza para pôr o polegar no Fá e continue a escala.',
    ['Pratique Dó–Ré–Mi, ajuste a mão e alcance Fá com o polegar sem acelerar.', 'Toque uma oitava da escala maior e observe se o punho permanece flexível.'],
    ['Planejo a mudança de posição antes de o polegar chegar.', 'Não torço o punho nem prendo o polegar sob a mão.'],
    ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']
  ),
  'n3-m15-t5': lesson(
    'Dinâmica é a intensidade relativa da música. Piano significa tocar suave; forte, tocar com mais intensidade. A mudança vem do controle do toque e do peso do braço, não de bater na tecla nem de tensionar o ombro.',
    'Toque C–D–E uma vez suave e outra mais forte, mantendo o mesmo andamento e a mesma duração.',
    ['Repita uma frase curta em piano e depois em forte, sem mudar o tempo.', 'Faça um crescendo gradual em quatro notas e volte a tocar suave.'],
    ['Produzo diferença de intensidade sem dor ou rigidez.', 'Mantenho o ritmo enquanto altero a dinâmica.'],
    ['Dó', 'Ré', 'Mi', 'Sol']
  ),
  'n3-m15-t6': lesson(
    'Legato conecta notas sem uma interrupção audível; staccato separa as notas com duração mais curta. O movimento deve continuar leve nos dois casos. A articulação é uma escolha musical, não uma disputa para tocar com força.',
    'Toque Dó–Ré–Mi primeiro conectado; depois repita as mesmas notas curtas e separadas.',
    ['Alterne duas notas legato e duas staccato sem acelerar.', 'Toque a mesma frase com as duas articulações e perceba a diferença de caráter.'],
    ['Consigo separar as notas sem levantar a mão em excesso.', 'Escolho a articulação sem tensionar o pulso.'],
    ['Dó', 'Ré', 'Mi', 'Sol']
  ),
  'n3-m15-t7': lesson(
    'O pedal sustain prolonga o som depois que você solta as teclas. Troque ou solte o pedal quando a harmonia muda para evitar que acordes diferentes se misturem. Ouça o resultado: o pedal deve sustentar, não encobrir as notas.',
    'Toque C, pressione o pedal logo após o ataque, e solte antes de passar para F. Depois troque o pedal junto com o novo acorde.',
    ['Alterne C e F com uma troca de pedal a cada acorde.', 'Toque a mesma sequência sem pedal e compare a clareza das mudanças.'],
    ['Coordeno o pedal com as mudanças harmônicas.', 'Solto o pedal se o som ficar turvo ou se misturar demais.'],
    ['Dó', 'Mi', 'Sol', 'Fá', 'Lá']
  ),
  'n3-m15-t8': lesson(
    'Hanon e Czerny são coleções históricas de exercícios e estudos técnicos. Eles podem ajudar a observar regularidade, coordenação e leitura, mas não substituem músicas nem garantem técnica sozinhos. Escolha um trecho curto, toque lentamente e interrompa se houver dor.',
    'Em um padrão de cinco notas, toque C–D–E–F–G e volte, com volume uniforme e sem acelerar.',
    ['Pratique um trecho breve de um exercício em andamento confortável e registre onde perde regularidade.', 'Depois do exercício, aplique o mesmo cuidado a uma frase de uma música que você goste.'],
    ['Uso o exercício com objetivo específico e por pouco tempo.', 'Paro diante de dor ou tensão e não persigo velocidade a qualquer custo.'],
    ['Dó', 'Ré', 'Mi', 'Fá', 'Sol']
  ),
};
