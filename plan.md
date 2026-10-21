# Trilha do Teclado — plano de implementação

## Produto e escopo

Construir uma plataforma educacional gratuita em português do Brasil, com navegação Nível → Módulo → Tópico, respeitando integralmente os 6 níveis, os 24 módulos e todos os tópicos do anexo. Entregar o conteúdo didático completo dos Níveis 1 e 2; nos Níveis 3 a 6, exibir os módulos e tópicos com indicação transparente de conteúdo em preparação, sem bloquear a consulta da estrutura.

Cada aula disponível terá explicação curta, exemplo concreto, teclado ilustrado com destaques, de 1 a 3 exercícios, checklist de domínio e de 1 a 3 vídeos reais do YouTube incorporados. A curadoria deve identificar título, canal, link, selo e justificativa. Mostrar os critérios de didática, comentários/avaliações, áudio/imagem e visualizações secundárias, sem inventar números nem afirmar avaliações que não foi possível verificar. Vídeos poderão ser reaproveitados quando atenderem mais de um tópico. Informar limitações verificadas na nota de curadoria. Não haverá ranking automático ou integração com a API do YouTube.

## Implementação

Aplicação React com TypeScript e Vite, com rotas para início, mapa, nível, módulo, tópico, teste de nível, glossário, prática e curadoria. O site será servido como aplicação estática: sem login, banco de dados ou backend, pois o requisito é salvar progresso no navegador. O Vite atenderá a Preview na porta 3000 em 0.0.0.0; a publicação será um build estático com instalação reprodutível e lockfile. Não publicar automaticamente sem autorização configurada pelo usuário.

Estado local persistente em localStorage: aulas concluídas, itens de checklist, resultados de quizzes e preferência claro/escuro. Calcular progresso real por tópico, módulo e nível; nunca preencher progresso fictício para ornamentação. Botão Começar abre a primeira aula; Continuar retoma a próxima aula disponível. Navegação lateral recolhível no celular e anterior/próximo em aulas. Busca por títulos e nomes de módulo com resultados navegáveis.

O mapa apresenta níveis e módulos ligados por uma linha de percurso. Teste de nivelamento com perguntas e recomendação de ponto de entrada, sem marcar aulas como concluídas. Mini-quiz contextual de cada módulo, com correção e explicação; módulos dos níveis ainda em preparação podem ter revisão introdutória, sem fingir conteúdo de aula pronto. Glossário pesquisável e teclado virtual de duas oitavas com áudio sintetizado via Web Audio, teclas do mouse/toque/teclado, destaques de notas, escalas, intervalos e acordes. Metrônomo com BPM, compasso, acento no primeiro tempo e controles de iniciar/parar; áudio inicia só após interação do usuário.

Os vídeos ficarão em `public/data/videos.json`, legível e editável sem alterações em componentes. Uma página de curadoria permitirá revisar dados, substituir links, exportar/importar o JSON e aplicar substituições locais; alterações locais ficam restritas ao navegador. Para atualizar a versão do site para todos, substituir o arquivo de dados e salvar nova versão.

## Estrutura do projeto

- `src/app/`: layout, rotas, contexto de progresso e tema.
- `src/pages/`: início, mapa, nível, módulo, aula, teste, glossário, ferramentas e curadoria.
- `src/components/`: navegação, cartões de nível, barras, teclado, metrônomo, quiz e vídeos.
- `src/data/`: currículo e conteúdos dos níveis iniciais, glossário e quizzes.
- `src/lib/`: utilitários de áudio, navegação, persistência e cálculos de progresso.
- `public/data/videos.json`: catálogo de vídeos editável.
- `public/`: manifesto de rotas e marca do site.
- `src/styles.css`: tokens, responsividade e modo escuro.

## Direção visual

Alternativas consideradas: editorial botânico e musical (probabilidade 0,07), laboratório musical com contrastes elétricos (0,04), caderno de conservatório monocromático (0,06). Escolha: editorial botânico e musical, alinhado ao pedido de leitura limpa e acolhedora.

**Movimento:** editorial contemporâneo com serenidade de papel e detalhes inspirados em partituras.

**Princípios:** leitura em primeiro lugar, hierarquia clara, progresso sem pressão e ferramentas práticas sempre acessíveis.

**Cores:** fundo marfim, tinta verde profunda e verde-sálvia como assinatura. Cada nível recebe uma cor própria: verde, azul, violeta, âmbar, rosa e terracota. O modo escuro usa superfícies verde-carvão, evitando branco luminoso. Não usar gradientes chamativos.

**Layout:** barra lateral persistente e conteúdo com margem generosa; abertura editorial em duas áreas assimétricas, com grande título à esquerda e um teclado interativo em destaque à direita. A trilha se desenvolve verticalmente com conexões, e o curso aparece em cartões legíveis, sem efeitos excessivos.

**Elementos de assinatura:** marca com três teclas e um trajeto; teclado de teclas marfim e verde; rótulos numerados de nível e linhas de percurso pontilhadas.

**Interação:** ações explícitas, estados de foco visíveis, checklists reversíveis, controles com rótulos e feedback imediato. Celular com navegação em drawer, sem rolagem horizontal de página.

**Animação:** transições suaves de 160–220 ms em controles e mudança de tema; teclas reagem ao toque; respeitar prefers-reduced-motion. Nada de animação contínua decorativa.

**Tipografia:** títulos em Fraunces, com personalidade editorial; corpo e interface em Manrope com fallbacks locais. Título inicial grande, aulas com coluna confortável e espaçamento generoso.

**Essência:** uma trilha gratuita e organizada para quem quer tocar teclado de verdade, do primeiro Dó às próprias músicas. Personalidade: acolhedora, clara, encorajadora.

**Voz:** direta e pedagógica. Exemplos: “Seu primeiro acorde começa com uma nota.” e “Vá no seu ritmo. A próxima etapa está aqui.”

**Marca:** símbolo de teclas formando um caminho e wordmark com duas linhas, mantendo Trilha do Teclado identificável em tamanhos pequenos. Cor assinatura: verde-floresta #285B46.

## Fluxo de entrega

Após aprovação: criar TODO com critérios completos; configurar diagnósticos; instalar dependências; produzir currículo e conteúdo e pesquisar vídeos em paralelo; construir interface e ferramentas; verificar typecheck, build e conexões por inspeção de código e agente independente somente leitura; corrigir problemas concretos; iniciar Preview e conferir manifesto; salvar checkpoint no repositório canônico. A primeira entrega estará disponível na Preview. Publicação depende da autorização/configuração do projeto.
