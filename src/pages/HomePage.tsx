import { ArrowDownRight, ArrowRight, AudioLines, BookOpen, CheckCircle2, Clock3, Compass, Music2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allTopics, levels } from '../data/curriculum';
import { useProgress } from '../context/ProgressContext';
import { ProgressBar } from '../components/ProgressBar';
import { PianoKeyboard } from '../components/PianoKeyboard';

export function HomePage() {
  const { completed } = useProgress();
  const readyTopics = allTopics.filter((topic) => topic.module.number <= 10);
  const nextTopic = readyTopics.find((topic) => !completed.includes(topic.id)) ?? readyTopics[0];
  const progress = Math.round(completed.filter((id) => readyTopics.some((topic) => topic.id === id)).length / readyTopics.length * 100);
  const levelDescriptions = ['Do primeiro contato às primeiras músicas.', 'Leia, reconheça e construa suas primeiras harmonias.', 'Ligue os acordes e acompanhe com intenção.', 'Encontre a linguagem de cada estilo musical.', 'Crie ideias próprias e leve-as ao instrumento.', 'Pratique com propósito e compartilhe sua música.'];

  return (
    <div className="page-stack home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> UMA TRILHA, SEU TEMPO</span>
          <h1>O teclado fica<br /><em>mais perto</em> a cada nota.</h1>
          <p>Um caminho gratuito, passo a passo, do primeiro Dó até tocar e criar as músicas que você gosta.</p>
          <div className="hero-actions"><Link to={`/aula/${nextTopic.id}`} className="button button-primary">{completed.length ? 'Continuar aprendendo' : 'Começar'} <ArrowRight size={17} /></Link><Link to="/trilha" className="button button-quiet">Conhecer a trilha <ArrowDownRight size={16} /></Link></div>
          <div className="hero-meta"><span><CheckCircle2 size={15} /> No seu ritmo</span><span><BookOpen size={15} /> Sem partitura no começo</span><span><Sparkles size={15} /> 100% gratuito</span></div>
        </div>
        <div className="hero-art">
          <div className="hero-note note-one">♪</div><div className="hero-note note-two">♫</div>
          <div className="hero-ring ring-one" /><div className="hero-ring ring-two" />
          <div className="hero-stamp"><span>COMECE</span><strong>HOJE</strong><small>um acorde de cada vez</small></div>
          <div className="hero-keyboard"><PianoKeyboard highlight={['Dó', 'Mi', 'Sol']} /></div>
          <span className="hero-art-caption">um som de cada vez</span>
        </div>
        <div className="hero-bottom-label">TRILHA 01 <span>·</span> PARA QUEM ESTÁ COMEÇANDO</div>
      </section>

      <section className="section-block progress-overview">
        <div className="section-heading"><div><span className="eyebrow">SEU CAMINHO</span><h2>Uma etapa por vez.</h2><p>Seu progresso fica salvo neste navegador.</p></div><Link to="/trilha" className="text-link">Ver mapa completo <ArrowRight size={15} /></Link></div>
        <div className="progress-overview-card"><div className="progress-overview-icon"><Music2 size={20} /></div><div className="progress-overview-main"><div className="progress-overview-copy"><strong>Níveis 1 e 2 · Fundamentos e teoria</strong><span>{completed.filter((id) => readyTopics.some((topic) => topic.id === id)).length} de {readyTopics.length} aulas concluídas</span></div><ProgressBar value={progress} /></div><div className="progress-overview-stat"><strong>{progress}%</strong><small>do caminho inicial</small></div></div>
      </section>

      <section className="section-block levels-section">
        <div className="section-heading"><div><span className="eyebrow">DA PRIMEIRA NOTA À CRIAÇÃO</span><h2>Seis níveis. Um caminho claro.</h2><p>Veja onde você está e para onde pode ir.</p></div><span className="level-count">06 <span>NÍVEIS</span></span></div>
        <div className="levels-grid">{levels.map((level, index) => {
          const total = level.modules.reduce((sum, module) => sum + module.topics.length, 0);
          const done = level.modules.reduce((sum, module) => sum + module.topics.filter((topic) => completed.includes(topic.id)).length, 0);
          return <Link to={`/nivel/${level.id}`} key={level.id} className={`level-card level-${level.number}`} style={{ '--level-color': level.color } as React.CSSProperties}>
            <div className="level-card-top"><span className="level-number">0{level.number}</span><span className="level-status">{level.number <= 2 ? 'CONTEÚDO DISPONÍVEL' : 'ESTRUTURA PRONTA'}</span></div>
            <h3>{level.title}</h3><p>{levelDescriptions[index]}</p><div className="level-card-bottom"><span>{level.modules.length} módulos <span className="footer-dot">·</span> {done}/{total} aulas</span><ArrowRight size={17} /></div><ProgressBar value={total ? Math.round(done / total * 100) : 0} compact />
          </Link>;
        })}</div>
      </section>

      <section className="section-block home-tools-section">
        <div className="section-heading"><div><span className="eyebrow">PRONTO PARA PRATICAR?</span><h2>Aprender também é experimentar.</h2></div></div>
        <div className="home-tools-grid">
          <Link to="/nivelamento" className="home-tool-card tool-test"><span className="tool-icon"><Compass size={19} /></span><span className="tool-card-copy"><strong>Descubra onde começar</strong><small>Responda algumas perguntas e encontre seu ponto de partida.</small></span><ArrowRight size={18} /></Link>
          <Link to="/pratica" className="home-tool-card tool-practice"><span className="tool-icon"><AudioLines size={19} /></span><span className="tool-card-copy"><strong>Abra a sala de prática</strong><small>Teclado virtual e metrônomo, prontos para você.</small></span><ArrowRight size={18} /></Link>
        </div>
      </section>
      <section className="quote-strip"><Clock3 size={17} /><p>Não precisa correr. <strong>Praticar com atenção vale mais do que correr para a próxima etapa.</strong></p><span>TRILHA DO TECLADO</span></section>
    </div>
  );
}
