const YOUTUBE_PRIVACY_URL = 'https://policies.google.com/privacy?hl=pt-BR';

export function PrivacyPage() {
  return (
    <article className="privacy-page" aria-labelledby="privacy-title">
      <header className="privacy-intro">
        <span className="eyebrow">TRANSPARÊNCIA</span>
        <h1 id="privacy-title">Privacidade na <em>Trilha do Teclado</em></h1>
        <p>Esta página explica, de forma direta, quais informações são usadas quando você aprende por aqui e como exercer seus direitos.</p>
        <p className="privacy-updated"><strong>Última atualização:</strong> <time dateTime="2026-10-31">31 de outubro de 2026</time></p>
      </header>

      <div className="privacy-sections">
        <section className="privacy-section" aria-labelledby="privacy-publico">
          <h2 id="privacy-publico">Uso público do site</h2>
          <p>As páginas públicas não oferecem cadastro ou contas para estudantes, nem formulários públicos de cadastro ou contato destinados a estudantes. O único formulário com campo de e-mail é o login da área administrativa restrita. O uso das aulas, exercícios e ferramentas não exige que você informe seu nome ou e-mail.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-localstorage">
          <h2 id="privacy-localstorage">Progresso e preferências no seu navegador</h2>
          <p>O progresso das aulas, itens de exercício marcados, resultados de quizzes e a preferência de tema claro ou escuro são guardados no <code>localStorage</code> do navegador, neste dispositivo e neste site. Esse conteúdo permanece no navegador e o site não o envia ao servidor.</p>
          <p>Não há um controle de apagar esses dados dentro do site. Para removê-los, use as configurações do navegador para limpar os dados de sites deste domínio, incluindo o armazenamento local (<code>localStorage</code>). Os nomes dos menus variam conforme o navegador; limpar somente o cache pode não apagar esses dados. A remoção apaga o progresso e as preferências guardados neste navegador.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-youtube">
          <h2 id="privacy-youtube">Vídeos do YouTube</h2>
          <p>O player do YouTube só é solicitado depois que você clica em reproduzir. A partir desse clique, o YouTube pode receber dados de acesso e tratar informações conforme suas próprias políticas e termos. Consulte a <a href={YOUTUBE_PRIVACY_URL} target="_blank" rel="noreferrer">Política de Privacidade do Google/YouTube</a>.</p>
          <p>Os vídeos são de seus respectivos canais; a Trilha do Teclado não reivindica sua autoria.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-fontes">
          <h2 id="privacy-fontes">Fontes tipográficas</h2>
          <p>As fontes Fraunces e Manrope são servidas a partir deste site. A página não solicita essas fontes a serviços externos.</p>
          <p>As amostras do Salamander Grand Piano são arquivos de áudio servidos pelo próprio site e reproduzidos no navegador após interação. O metrônomo também gera seus cliques no navegador. As notas tocadas não são enviadas ao servidor.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-hospedagem">
          <h2 id="privacy-hospedagem">Hospedagem e métricas</h2>
          <p>As métricas opcionais de visita configuráveis para as páginas do site estão desativadas. A hospedagem e a rede de distribuição ainda podem processar registros técnicos, como requisições e eventos de segurança, para operar e proteger o serviço, conforme as políticas desses provedores. O selo Manus exibido na página pode incluir métricas próprias da plataforma, independentemente das métricas de visita desativadas.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-admin">
          <h2 id="privacy-admin">Área administrativa</h2>
          <p>O e-mail é usado somente para autenticar o administrador e identificar sua sessão administrativa. Estudantes não precisam fornecer e-mail para usar as páginas públicas.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-lgpd">
          <h2 id="privacy-lgpd">Seus direitos</h2>
          <p>Nos termos do art. 18 da Lei Geral de Proteção de Dados (LGPD), quando aplicável, você pode solicitar confirmação da existência de tratamento e acesso aos dados; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade; portabilidade, observadas as regras aplicáveis; eliminação de dados tratados com consentimento, ressalvadas as hipóteses legais de conservação; informação sobre entidades públicas e privadas com as quais tenha havido uso compartilhado; informação sobre a possibilidade de não fornecer consentimento e suas consequências; e revogação do consentimento, quando essa for a base do tratamento. Também é possível peticionar perante a autoridade nacional e, nas condições legais, opor-se a tratamento realizado em desconformidade com a LGPD.</p>
          <p>Para encaminhar uma solicitação ou dúvida sobre privacidade, use o contato <code>[EMAIL DE CONTATO]</code> (substituir pelo endereço correto antes da publicação). Este texto é informativo e não representa garantia de conformidade jurídica absoluta; a análise de cada solicitação depende das circunstâncias e das regras aplicáveis.</p>
        </section>

        <section className="privacy-section privacy-credits" aria-labelledby="privacy-creditos">
          <h2 id="privacy-creditos">Créditos</h2>
          <p>As amostras de piano são do <a href="https://github.com/sfzinstruments/SalamanderGrandPiano" target="_blank" rel="noreferrer">Salamander Grand Piano</a>, por Alexander Holm, sob licença <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>.</p>
          <p>Fraunces e Manrope são distribuídas sob a SIL Open Font License 1.1; os avisos de copyright e cópias das licenças acompanham os arquivos locais em <code>public/fonts</code>.</p>
        </section>
      </div>
    </article>
  );
}
