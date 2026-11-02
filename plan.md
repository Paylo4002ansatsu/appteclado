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


## Rodada aprovada — segurança, privacidade e qualidade (2026-10-31)

Preservar layout, cores, textos das aulas e quizzes. Implementar as correções descritas no anexo do usuário e, ao final, enviar o commit ao GitLab `projetoteclas` após `pnpm check` e `pnpm build`, com relatório item a item.

### Proteção de API e cabeçalhos

Em `server/main.ts`, definir `strict routing` e `case sensitive routing` e substituir a allowlist do `requireAuth` por negação padrão: todas as rotas sob `/api/admin` exigem sessão, com apenas `GET /auth/csrf`, `POST /auth/login` e `GET /auth/session` como exceções públicas. A guarda do prefixo deve ser case-insensitive e independente de barra final para que variantes não correspondentes às rotas Express também exijam sessão; caminhos API desconhecidos retornam JSON 404, nunca a SPA. Confirmar os caminhos exatos indicados pelo usuário retornando 401 sem sessão.

Adicionar Helmet e os cabeçalhos CSP, HSTS de pelo menos seis meses com `includeSubDomains`, `nosniff`, política de referrer e Permissions-Policy. A CSP restringe scripts, estilos, imagens, fontes, conexões, mídia e frames às origens necessárias. O HSTS é emitido em HTTPS. Não emitir `X-Frame-Options` nem `frame-ancestors 'none'/'self'` isolado: o Preview WebDev é exibido em iframe cross-site, e esses cabeçalhos o bloqueariam. Manter a política sem diretiva `frame-ancestors`, conforme a exigência do runtime, e restringir `frame-src` ao YouTube privacy-enhanced usado pelos players.

### Privacidade de fontes, vídeos e visitantes

Hospedar localmente woff2 de Fraunces nos pesos 500/600/700 e Manrope 400/500/600/700/800, com `font-display: swap`; remover solicitações a Google Fonts. O player público começa como cartão sem imagem ou iframe remoto; só ao clique carrega `youtube-nocookie.com` com autoplay desligado e o aviso de coleta do YouTube. A prévia administrativa também pode ser acionada pelo operador ao clicar, sem impedir a conferência da URL. Ocultar evidências públicas cujo texto comece com “não verificado”, mantendo o selo de curadoria, e contar os vídeos afetados.

Criar `/privacidade`, adicionar o link no rodapé e explicar em português claro: ausência de cadastro e formulários para estudantes; progresso em `localStorage` e como apagá-lo; carregamento do YouTube apenas após clique e a política do YouTube; fontes e amostras servidas localmente; uso restrito do e-mail administrativo; direitos LGPD (art. 18); créditos de piano Salamander Grand Piano/Alexander Holm/CC BY 3.0 e vídeos dos respectivos canais. Exibir o marcador `[EMAIL DE CONTATO]` até que o responsável forneça um endereço e registrar a data de atualização como 31 de outubro de 2026.

### Login, banco e container

Persistir limites no MySQL por hash de IP e hash combinado IP+e-mail: 20 tentativas por IP e 5 por combinação em 15 minutos; preservar resposta genérica, serializar atualizações e limpar registros expirados sem guardar IP/e-mail em claro. Aumentar novas senhas para scrypt N=131072, r=8, p=1 com `maxmem` explícito; verificar hashes antigos N=16384 e regravar com o custo forte após login válido. Se o runtime não suportar memória necessária, reduzir para N=65536 e documentar. Usar `SameSite=Strict` quando HTTPS no domínio publicado; manter `SameSite=None; Secure` apenas no Preview HTTPS cross-site, obrigatório para cookies dentro do iframe WebDev; HTTP local continua separado. Adicionar `.env`, `.env.*` e `*.pem` ao `.gitignore`; `.dockerignore` exclui `node_modules`, saídas, `.git` e `.env*`; container runtime executa como `node` sem privilégios.

Executar `pnpm audit` e atualizar dependências vulneráveis de severidade alta/crítica quando compatível; relatar achados restantes. Auditoria somente leitura do GitLab identificou uma DSN local hardcoded em `drizzle.config.ts` (host loopback); remover o fallback e exigir `DATABASE_URL` do ambiente, sem imprimir nem versionar credenciais.

### Arquivos e estrutura previstos

- `server/app.ts`, `server/main.ts`, `server/lib/security.ts`, `server/db/schema.ts` e nova migration: guarda por padrão, cabeçalhos, rehash e tabela persistente de rate limit.
- `src/components/VideoEmbed.tsx` e prévia do admin: iframe carregado somente por ação explícita; filtro de evidências não verificadas.
- `src/pages/PrivacyPolicyPage.tsx`, `src/App.tsx`, footer e `public/manus-routes.json`: política e rota pública.
- `public/fonts/` e `src/styles.css`: woff2 self-hosted, sem chamadas de terceiros para tipografia.
- `Dockerfile`, `.gitignore`, `.dockerignore`, `drizzle.config.ts` e `package.json`: hardening de build, container e dependências.
- `TODO.md`: critérios completos e evidências da rodada; não alterar conteúdo didático, quizzes, paleta ou composição pública existente fora das mudanças pedidas.


## Evidência de auditoria externa (2026-10-31)

Repositório público auditado: [GitLab — PauloGerson/projetoteclas](https://gitlab.com/PauloGerson/projetoteclas), branch `main`. A auditoria inicial de 2026-10-31 examinou 11 commits, 80 caminhos históricos e 107 blobs: nenhum nome de arquivo sensível nem credencial de produção foi encontrado. Em 2026-11-02, o hardening foi sincronizado ao `main` sem reescrever histórico; 29 arquivos foram comparados por SHA-256 e o README permaneceu inalterado. A ponta atual contém um commit adicional sobre a auditoria inicial. A referência localhost genérica removida é descrita separadamente abaixo; não é credencial de serviço remoto.


### Fontes tipográficas

As páginas oficiais do Google Fonts identificam Fraunces como variável e Manrope como variável. Os dois diretórios oficiais em `google/fonts` publicam suas licenças SIL Open Font License 1.1; vou incluir os avisos/licenças junto dos WOFF2 auto-hospedados. Fontes: [Fraunces](https://fonts.google.com/specimen/Fraunces), [Manrope](https://fonts.google.com/specimen/Manrope), [licença Fraunces](https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/OFL.txt) e [licença Manrope](https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt).


### Avisos de dependências — `pnpm audit` (2026-10-31)

A primeira auditoria do lockfile encontrou 2 avisos moderados e nenhum alto/crítico. O aviso de esbuild afeta versões até 0.24.2 e informa correção a partir de 0.25.0; o aviso do Vite afeta 6.4.4 e indica 6.4.5 como corrigida. Fontes oficiais: [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) e [GHSA-8g5g-mxqh-grgj](https://github.com/advisories/GHSA-8g5g-mxqh-grgj). Vou atualizar somente o patch compatível e repetir a auditoria.


### Evidências técnicas de fechamento (2026-10-31)

- `pnpm check` e `pnpm build` passaram; o Vite atualizado está em 6.4.5. `git diff --check` não encontrou problemas de whitespace.
- `pnpm audit` encontrou 1 aviso moderado, sem avisos altos/críticos: `esbuild@0.18.20` transitivo de desenvolvimento via `drizzle-kit`/`@esbuild-kit`; `pnpm audit --prod` reportou zero vulnerabilidades. O Vite recebeu o patch 6.4.5 corrigido.
- O manifesto público contém 12 rotas, incluindo `/privacidade`; a rota pública, o catálogo e os assets locais responderam no smoke do build compilado. As fontes Fraunces e Manrope são WOFF2 locais com OFL 1.1; nenhuma referência a Google Fonts foi encontrada em fonte ou build.
- Teste público no navegador: tocar Dó4 baixou `audio/grand-piano/C4.mp3` do próprio domínio; nenhuma requisição para Google Fonts ou YouTube acompanhou a nota. O metrônomo passou de “Começar” para “Pausar”. Na curadoria, antes do clique havia zero iframes, miniaturas e recursos do YouTube; depois de expandir o tópico e clicar Play, criou-se iframe `youtube-nocookie.com` com `autoplay=0`.
- Smoke sem sessão confirmou HTTP 401 para rotas administrativas conhecidas com variações de barra/maiúsculas, e 404 JSON para API desconhecida; `/admin` e seus dados continuam protegidos por default-deny. Não foi feito login real nem operações autenticadas, para evitar criar sessões/contadores de teste no MySQL compartilhado; a validação de CRUD, login/logout e prévia autenticada permanece não exercitada neste ciclo.
- A migration aditiva de limites persistentes foi aplicada; a tabela correspondente existe e estava com zero tentativas no momento da leitura. IP/e-mail são transformados em hashes; os limites implementados são 20 por IP e 5 por IP+e-mail em 15 minutos. Hashes scrypt novos/legados e atributos de cookie foram verificados por testes sintéticos; sessão real não foi criada.
- O container final roda como `node`, com `APP_COOKIE_SECURE=true` e `APP_COOKIE_SAME_SITE=strict`. O Preview HTTPS usa `SameSite=None; Secure` por estar em iframe cross-site; a borda do Preview informa `Referrer-Policy: no-referrer`, mais restritiva que a política `strict-origin-when-cross-origin` definida no backend local.
- A política `/privacidade` informa armazenamento local, carregamento tardio do YouTube, áudio/fontes locais, limites do uso de analytics, LGPD, créditos e o marcador `[EMAIL DE CONTATO]`. O analytics configurável da plataforma foi confirmado desativado; o badge Manus permanece visível e pode incluir métricas próprias, explicitamente informado na política.
- Curadoria pública: 59 vídeos no total; 46 têm pelo menos uma nota “não verificada” ocultada, totalizando 114 evidências ocultadas. Nenhuma nota interna aparece na saída pública.
- A auditoria somente leitura do histórico GitLab registrada acima encontrou zero nomes de arquivos sensíveis e zero padrões de credenciais correspondentes nos 11 commits/80 caminhos/107 blobs examinados. `drizzle.config.ts` não mantém fallback de DSN; `DATABASE_URL` é exigida do ambiente. Não foi identificada credencial que precise ser revogada/rotacionada.
- Pendências: substituir `[EMAIL DE CONTATO]` antes da publicação final; autenticação end-to-end e prévia administrativa não foram testadas contra o banco compartilhado. O GitLab `main` foi sincronizado, com README preservado; o repositório canônico Manus continua sendo a fonte dos checkpoints e a publicação automática continua autorizada.

### Estado do espelho antes da sincronização final

Antes da sincronização, a API pública confirmou que `main` tinha 11 commits e 92 caminhos na primeira página da árvore. A ponta `6117f525cd0e1f5d67979f7c0319b5e2d2160579` era um merge com os pais `4823a...` e o commit canônico Manus `43f845f...`; a única diferença de árvore era a adição do README público de 37 linhas. Em 2026-11-02 o espelho recebeu as alterações de hardening por uma atualização normal de `main`; 29 arquivos foram verificados por SHA-256 e o README teve hash idêntico. Nenhum histórico foi reescrito ou removido.


### Nota sobre o scanner do diff

A verificação do patch identificou apenas uma referência de conexão localhost que estava em uma linha removida do fallback antigo de desenvolvimento em `drizzle.config.ts`; era um valor local genérico, não uma DSN de serviço externo ou produção. A árvore staged atual não contém DSN hardcoded, o fallback foi eliminado e `DATABASE_URL` é obrigatória no ambiente. Como o histórico foi preservado sem reescrita, o diff da remoção pode exibir essa referência local em commits anteriores; não há segredo de produção identificado para revogar.


## Adaptação Vercel serverless (solicitada em 2026-11-02)

A tela publicada em `appteclado.vercel.app` é uma SPA Vite, e a falha observada ocorre porque o backend Express não está exposto em `/api/*`. Preservar o build do frontend como arquivos estáticos em `dist` e expor o Express como uma função Node compartilhada da Vercel. Separar a criação/registro de rotas do `app.listen`: `server/app.ts` exporta o Express app reutilizável; `server/main.ts` permanece somente como listener para Manus Preview/Docker. A entrada de função em `api/index.ts` encaminha as rotas e preserva método, headers, cookies, query e body. Em `vercel.json`, declarar build `pnpm build`, output `dist`, rewrite de `/api/*` para a função antes do fallback SPA e headers de segurança no HTML/arquivos estáticos; Helmet continua a cobrir respostas da API. Não executar migrations no início da função. Reutilizar o pool MySQL entre invocações quentes e manter o `DATABASE_URL` exclusivamente como Secret de Production, sem colocá-lo no Git, no frontend ou em artefatos de build. Para Vercel Production, cookies `Secure; SameSite=Strict`; preservar `SameSite=None; Secure` no Preview WebDev e tratamento `Lax`/não Secure para HTTP local.

Fontes técnicas consultadas: [Express on Vercel](https://vercel.com/docs/frameworks/backend/express) documenta Express como uma Function e limita `express.static()`; por isso a SPA deve continuar estática no output Vite. [Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js) recomenda uma função compartilhada em `api/` para rotas relacionadas. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) documenta output SPA e fallback; [Rewrites](https://vercel.com/docs/routing/rewrites) confirma que parâmetros de caminho podem ser encaminhados como query. [Vercel CLI env](https://vercel.com/docs/cli/env) documenta Secret por ambiente e redeploy para aplicar alterações.

### Risco de credenciais TiDB antes da transferência

A PingCAP informou que houve acesso não autorizado a sistemas internos entre 9 de setembro e 7 de outubro de 2026 e cópia de alguns dados de sistemas internos; declarou não haver evidência de acesso aos dados armazenados nos clusters TiDB na revisão publicada, mas a investigação de impacto por cliente continua. A recomendação oficial é trocar chaves de gestão TiDB Cloud e rotacionar credenciais/strings de conexão que tenham sido compartilhadas com o suporte. Fontes primárias: [relatório de incidente](https://www.pingcap.com/trust-hub/security/security-update-october-2026/), [ações recomendadas ao cliente](https://www.pingcap.com/trust-hub/security/customer-actions-october-2026/) e [nota do CEO](https://www.pingcap.com/trust-hub/security/ceo-note-october-2026/). Uma pergunta foi enviada ao usuário; não enviar a URL atual para a Vercel até a confirmação de que ela não foi compartilhada com o suporte, ou até receber uma URL já rotacionada.

A documentação do [firewall TiDB Cloud Starter/Essential](https://docs.pingcap.com/tidbcloud/configure-serverless-firewall-rules-for-public-endpoints/) diz que novos endpoints públicos permitem todos os IPs por padrão, mas regras de firewall podem restringir conexões; [conexão por endpoint público](https://docs.pingcap.com/tidbcloud/connect-via-standard-connection-serverless/) exige TLS e origem autorizada. Confirmar o acesso somente por smoke de leitura; não abrir firewall nem alterar o banco sem autorização específica.


### Evidência da adaptação Vercel — código e testes locais (2026-11-02)

`server/app.ts` agora exporta o Express sem abrir listener; `server/main.ts` mantém o listener usado por Docker/Manus e seu encerramento do pool. `api/index.ts` é uma única entrada Node que reconstrói o caminho original `/api/*` enviado pelas rewrites e passa a mesma requisição ao Express. `vercel.json` declara o build Vite estático, rewrite API antes do fallback SPA e os cabeçalhos de segurança para as respostas do deployment; Node 22 foi fixado. `server/lib/security.ts` preserva overrides do Preview (`None; Secure`) e usa `Strict; Secure` em produção; HTTP de desenvolvimento fica `Lax` sem `Secure`.

Verificações locais: `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, JSON do `vercel.json`, testes de reconstrução de path e cookies passaram. O handler HTTP emulado da Function respondeu `/api/health` 200, `/api/public/course` 200 (6 níveis/24 módulos), `/api/admin/modules` 401 e rota desconhecida 404 JSON; servidor compilado persistente também serviu `/` e `/privacidade` com 200. Não houve escrita no banco. `pnpm audit` registra uma vulnerabilidade moderada dev-only em `esbuild`; nenhuma alta/crítica e audit de produção limpo.

**Ainda não publicado ao GitHub/Vercel:** o repasse do `DATABASE_URL` e o push que dispararia o deployment foram pausados por segurança até o usuário esclarecer se a credencial atual foi compartilhada com o suporte PingCAP durante o incidente informado. Portanto, a rota pública Vercel só será validada após a decisão/rotação e deployment autorizado.
