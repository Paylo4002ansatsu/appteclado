# Trilha do Teclado — plano de implementação

## Produto e escopo

A Trilha do Teclado é uma plataforma educacional gratuita em português do Brasil, organizada em níveis → módulos → tópicos. Preservar os seis níveis, 24 módulos, IDs atuais e a estrutura pedagógica aprovada. Os módulos 1–15 correspondem ao conteúdo detalhado atualmente existente; os módulos 16–24 permanecem com estrutura/tópicos planejados, sem inventar aulas. O progresso dos alunos continua salvo no navegador, sem criar contas para estudantes.

Aulas disponíveis exibem explicação, exemplo, exercícios, checklist, ilustração ou atividade interativa pertinente e vídeos incorporados selecionados. Preservar os critérios de curadoria e as notas transparentes já existentes. O painel de acorde permite escolher opções contextuais, ouvir acorde/arpejo e ver notas destacadas; a família de acordes disponibiliza as 12 fundamentais nas aulas em que isso é conteúdo central.

## Incremento aprovado — CMS completo com backend e banco

Converter o front-end Vite/React atual em aplicação React servida por Node/Express e MySQL gerenciado. O banco passa a ser a fonte de verdade dos níveis, módulos, tópicos, textos de aula, exercícios/checklists, quizzes, glossário, vídeos e configurações de teclado/acordes. As estruturas TypeScript e o JSON originais ficam preservados em `scripts/fixtures/` somente para a migração inicial; a aplicação pública não os usa como fallback após a transição.

O painel `/admin` é destinado a um único administrador, sem cadastro público. O e-mail e a senha iniciais serão fornecidos somente por entrada segura do projeto; guardar hash de senha com `scrypt`, nunca a senha em texto. Criar sessões revogáveis de sete dias com token aleatório armazenado no banco apenas como hash, cookie `HttpOnly`, logout e limite de tentativas de login. Em Preview HTTPS/publicado, a sessão usa `SameSite=None; Secure`; o tratamento local em HTTP é separado. A autenticação e autorização são verificadas no servidor em todas as rotas administrativas, não apenas escondidas no React. Visitante sem sessão recebe apenas o formulário de login; não recebe conteúdo administrativo nem dados de rascunho.

Cada módulo terá versões independentes de trabalho e publicada para conteúdo e metadados (nível, número, ordem e prontidão). Salvar edições ou reordenar atualiza apenas o rascunho; o botão “Publicar” troca o conteúdo e os metadados visíveis sem novo deploy. Módulos novos começam como rascunho. Os módulos existentes são importados com conteúdo e visibilidade atuais preservados. “Ver no site” abre a versão publicada; para rascunhos, abre uma prévia protegida por sessão. O glossário também mantém campos de rascunho separados dos campos públicos: salvar não altera o site, “Publicar” troca a versão pública e “Despublicar” a remove do site sem apagar o rascunho.

## Dados, migração e acesso

Modelo inicial em MySQL: `levels` para nome, ordem, cor e metadados do nível; `modules` para ID legado estável, metadados de rascunho e snapshots JSON separados de conteúdo/metadados publicados; `glossary_entries` mantém `term`, `definition`, `group_name` e `is_published` públicos, mais `draft_term`, `draft_definition` e `draft_group`; `admin_users`; `admin_sessions`; `content_migrations` para registrar a importação legada. O Drizzle Kit mantém o histórico de migrations de esquema. O JSON de conteúdo do módulo mantém tópicos, textos e exemplos, exercícios, checklist, destaques/interatividade, perguntas do quiz e vídeos, preservando IDs de tópico e vídeo para progresso, navegação e links. A API valida esse JSON no servidor e o Drizzle executa consultas parametrizadas. As migrations são versionadas e aditivas; a importação de conteúdo é idempotente, executada separadamente do servidor e não sobrescreve conteúdo depois de registrada.

Importar o estado atual sem truncar dados nem apagar arquivos de origem: 6 níveis, 24 módulos, 140 tópicos, 91 textos de aula, 59 vídeos de curadoria, 68 perguntas efetivas de quiz (50 explícitas e 18 de orientação) e 31 verbetes de glossário. Importar também os destaques e configurações de acorde/teclado existentes. Manter a distinção de conteúdo pronto/planejado: módulos 1–15 prontos e 16–24 planejados. A migração é idempotente, conserva IDs e confirma a conclusão por versão registrada; não executar novamente como seed que restaura valores padrão. O banco gerenciado é compartilhado pelo desenvolvimento e pela publicação; toda migração/escrita em desenvolvimento altera os dados usados pelo site publicado, portanto não usar dados temporários nem testes que criem e apaguem registros reais.

API pública: `GET /api/public/course` fornece em uma resposta os níveis, módulos e verbetes publicados (glossário filtrado por `is_published`), sempre somente leitura e com `Cache-Control: no-store`, para que a aplicação refaça a leitura na navegação, foco e atualização periódica. API administrativa: login, sessão e logout; listar/criar/editar/excluir/reordenar módulos; salvar/publicar rascunhos; editar tópicos e textos; criar/editar/remover/reordenar/mover vídeos; gerenciar quizzes e atividades; e salvar, publicar e despublicar rascunhos do glossário. Reordenação/movimentação que afete mais de um módulo usa transação e não altera a ordem pública antes de “Publicar”. A prévia do YouTube aceita URL `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/` e formato Shorts; valida host e ID no cliente e servidor, mostra player antes de salvar e não promete que vídeo privado ou sem permissão de embed será reproduzível.

## Implementação e serving

Manter React 19, TypeScript, Vite e o desenho atual. Adicionar Express, Drizzle ORM/Drizzle Kit, driver MySQL (`mysql2`) e validação de payload (`zod`), com migrations SQL versionadas. Em desenvolvimento, Vite continua no runtime port 3000 e encaminha `/api` ao servidor Express local; nenhum valor privado usa prefixo `VITE_`. Em produção, o Dockerfile compila o Vite e o servidor TypeScript e inicia Express, que serve `dist` e a API no mesmo listener `PORT`; `GET /api/health` é o health check público não autenticado. O projeto WebDev usa o container e o MySQL gerenciado. A ativação unidirecional de `server` e `database` foi explicitamente aprovada e concluída para este escopo.

O front-end consulta a API para home, mapa, níveis, módulos, tópicos, busca, quizzes, glossário, vídeos e atividades; tratar carregamento, erro e módulo inexistente. Remover o override localStorage de vídeos como mecanismo de publicação. O progresso do aluno, tema e estado de estudo continuam locais, com IDs estáveis. Novas edições publicadas são lidas do banco na próxima consulta/navegação, sem build ou redeploy.

## Estrutura prevista

- `server/main.ts`: rotas Express, health check, proteção de API, erros e serving da SPA em produção.
- `server/db/`: pool MySQL e schema Drizzle; `drizzle/`: migrations versionadas de esquema.
- `server/lib/security.ts` e `server/lib/content.ts`: senha/sessões/CSRF, validação de snapshots e URLs do YouTube.
- `scripts/import-legacy.ts` e `scripts/bootstrap-admin.ts`: importação idempotente e criação segura da conta inicial.
- `src/lib/adminApi.ts` e `src/context/CourseContentContext.tsx`: acesso tipado às APIs admin/pública, estados de carga/erro e atualização periódica.
- `src/pages/AdminPage.tsx`, `AdminPreviewPage.tsx` e `src/styles/admin.css`: login, lista e editores de módulo/tópico, vídeo, quiz, glossário e atividades.
- `src/pages/` e `src/components/` existentes: telas públicas passam a consumir dados publicados, preservando o visual e o progresso.
- `scripts/fixtures/`: fontes legadas preservadas somente para a migração reproduzível; ficam fora do código ativo da interface e dos arquivos servidos publicamente.
- `Dockerfile`, `package.json`, lockfile e `public/manus-routes.json`: build/release reproduzível, saúde e declaração completa de páginas.

## Direção visual

Reutilizar a identidade editorial botânica e musical já aprovada; a mudança é funcional, não uma reformulação da experiência pública. O painel administrativo usa os mesmos tokens, tipografia e modo claro/escuro, com formulários legíveis, estado explícito de rascunho/publicação, foco visível e ações acessíveis por teclado/toque. Não inserir link de administração na navegação pública.

**Movimento:** editorial contemporâneo com serenidade de papel e detalhes inspirados em partituras.

**Princípios:** leitura em primeiro lugar, hierarquia clara, progresso sem pressão e ferramentas práticas sempre acessíveis.

**Cores:** fundo marfim, tinta verde profunda e verde-sálvia como assinatura. Cada nível recebe uma cor própria: verde, azul, violeta, âmbar, rosa e terracota. O modo escuro usa superfícies verde-carvão, evitando branco luminoso. Não usar gradientes chamativos.

**Layout:** barra lateral persistente e conteúdo com margem generosa; abertura editorial assimétrica; trilha vertical conectada; cartões legíveis. No admin, editor em coluna principal e estado/ações claros, sem painel excessivamente denso.

**Elementos de assinatura:** marca com três teclas e um trajeto; teclado de teclas marfim e verde; rótulos numerados de nível e linhas de percurso pontilhadas.

**Interação:** ações explícitas, estados de foco visíveis, checklists reversíveis, controles com rótulos e feedback imediato. No celular, navegação em drawer e formulários sem rolagem horizontal.

**Animação:** transições suaves de 160–220 ms em controles e mudança de tema; respeitar `prefers-reduced-motion`; sem animação contínua decorativa.

**Tipografia:** títulos em Fraunces, com personalidade editorial; corpo e interface em Manrope com fallbacks locais.

**Essência:** uma trilha gratuita e organizada para quem quer tocar teclado de verdade, do primeiro Dó às próprias músicas. Personalidade: acolhedora, clara, encorajadora.

**Voz:** direta e pedagógica. Exemplos: “Seu primeiro acorde começa com uma nota.” e “Vá no seu ritmo. A próxima etapa está aqui.”

**Marca:** símbolo de teclas formando um caminho e wordmark com duas linhas. Cor assinatura: verde-floresta `#285B46`.

## Fluxo de implementação e entrega

O usuário aprovou o CMS completo. Os recursos `server` e `database` foram habilitados uma única vez; migrations aditivas, importação dos 24 módulos e bootstrap de uma conta admin foram concluídos, e as credenciais temporárias foram removidas. O banco confirma 6 níveis, 24 módulos, 140 tópicos, 91 aulas textuais, 59 vídeos, 68 perguntas de quiz, 31 verbetes e metadados publicados preenchidos. O Preview responde health 200, entrega o catálogo pelo banco e bloqueia `/api/admin/modules` sem sessão (401); manifesto de rotas responde 200. `pnpm check` e `pnpm build` passaram. O banco é compartilhado: evitar writes de teste; completar revisão somente leitura, preservar alterações existentes no working tree e integrar os arquivos pretendidos ao checkpoint canônico. Conferir a preferência de autopublicação antes de salvar o checkpoint; não alterá-la.


### Atualização pós-revisão — publicação do glossário

A migration aditiva `0002_chief_tana_nile.sql` foi aplicada: os 31 verbetes existentes permaneceram publicados e tiveram os campos de rascunho preenchidos sem apagar nem substituir os valores públicos. O editor salva apenas os campos draft; ações explícitas publicam ou despublicam, e a API pública filtra por `is_published`. O smoke da build compilada na porta temporária confirmou health 200, catálogo 6/24/31, `/admin` e manifesto 200, e 401 em GET/POST administrativos sem sessão. Os formatos watch, youtu.be, embed e Shorts passaram na validação; host, esquema e porta suspeitos foram rejeitados. A revisão técnica somente leitura após as correções não encontrou bloqueadores; nenhuma operação de teste gravou ou apagou conteúdo do banco.
