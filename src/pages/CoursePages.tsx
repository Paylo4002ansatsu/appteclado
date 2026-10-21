import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, CirclePlay, Clock3, LockKeyhole, Music2, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { allTopics, contentReady, findModule, findTopic, levels } from '../data/curriculum';
import { getLesson } from '../data/lessons';
import { topicHighlights } from '../data/topicHighlights';
import { useProgress } from '../context/ProgressContext';
import { useVideoCatalog } from '../hooks/useVideoCatalog';
import { ProgressBar } from '../components/ProgressBar';
import { PianoKeyboard } from '../components/PianoKeyboard';
import { VideoEmbed } from '../components/VideoEmbed';
import { ModuleQuiz } from '../components/ModuleQuiz';

export function LevelPage() {
  const { levelId = '' } = useParams();
  const level = levels.find((item) => item.id === levelId);
  const { completed } = useProgress();
  if (!level) return <NotFoundPage />;
  const ids = level.modules.flatMap((courseModule) => courseModule.topics.map((topic) => topic.id));
  const done = ids.filter((id) => completed.includes(id)).length;
  return <div className="page-stack course-page">
    <div className="course-breadcrumb"><Link to="/trilha">Mapa da trilha</Link><ChevronRight size={14} /><span>Nível {level.number}</span></div>
    <section className="level-hero-panel" style={{ '--level-color': level.color } as React.CSSProperties}>
      <span className="level-hero-no">NÍVEL {String(level.number).padStart(2, '0')}</span><h1>{level.title}<em>.</em></h1><p>{level.subtitle}</p>
      <div className="level-hero-meta"><span>{level.modules.length} módulos</span><span>{ids.length} tópicos</span><span>{done} aulas concluídas</span></div><ProgressBar value={Math.round(done / Math.max(1, ids.length) * 100)} />
    </section>
    <div className="module-section-heading"><div><span className="eyebrow">ORDEM DE ESTUDO</span><h2>Os módulos deste nível</h2><p>Avance na sequência ou retome um tópico que queira praticar.</p></div></div>
    <div className="level-module-list">{level.modules.map((courseModule) => {
      const ready = contentReady(courseModule.number);
      const moduleDone = courseModule.topics.filter((topic) => completed.includes(topic.id)).length;
      return <Link to={`/modulo/${courseModule.id}`} key={courseModule.id} className="level-module-row">
        <span className="module-no">{String(courseModule.number).padStart(2, '0')}</span><span className="level-module-main"><span className="module-ready-label">{ready ? 'CONTEÚDO DISPONÍVEL' : 'ESTRUTURA PRONTA'}</span><strong>{courseModule.title}</strong><small>{courseModule.topics.length} tópicos <span>·</span> {moduleDone} concluídos</small></span><span className="module-availability">{ready ? <CirclePlay size={19} /> : <LockKeyhole size={17} />}</span>
      </Link>;
    })}</div>
    <Link to="/trilha" className="button button-soft back-button"><ArrowLeft size={15} /> Voltar ao mapa</Link>
  </div>;
}

export function ModulePage() {
  const { moduleId = '' } = useParams();
  const courseModule = findModule(moduleId);
  const { completed } = useProgress();
  if (!courseModule) return <NotFoundPage />;
  const ready = contentReady(courseModule.number);
  const moduleDone = courseModule.topics.filter((topic) => completed.includes(topic.id)).length;
  return <div className="page-stack course-page">
    <div className="course-breadcrumb"><Link to="/trilha">Mapa</Link><ChevronRight size={14} /><Link to={`/nivel/${courseModule.level.id}`}>Nível {courseModule.level.number}</Link><ChevronRight size={14} /><span>Módulo {courseModule.number}</span></div>
    <section className="module-hero" style={{ '--level-color': courseModule.level.color } as React.CSSProperties}>
      <span className="eyebrow">NÍVEL {courseModule.level.number} <span className="footer-dot">·</span> MÓDULO {String(courseModule.number).padStart(2, '0')}</span>
      <h1>{courseModule.title}<em>.</em></h1><p>{courseModule.topics.length} tópicos organizados em uma sequência gradual.</p>
      {!ready && <div className="content-upcoming"><Sparkles size={17} /><span><strong>Este módulo já tem seu lugar na trilha.</strong> As aulas detalhadas serão publicadas em uma próxima etapa.</span></div>}
      <ProgressBar value={ready ? Math.round(moduleDone / Math.max(1, courseModule.topics.length) * 100) : 0} label={`${moduleDone} de ${courseModule.topics.length} aulas${ready ? ' concluídas' : ' listadas'}`} />
    </section>
    <div className="topic-list-heading"><div><span className="eyebrow">POR ONDE PASSAR</span><h2>Conteúdo do módulo</h2></div>{ready && <Link to={`/aula/${courseModule.topics.find((topic) => !completed.includes(topic.id))?.id ?? courseModule.topics[0].id}`} className="text-link">{moduleDone ? 'Continuar' : 'Começar módulo'} <ArrowRight size={15} /></Link>}</div>
    <ol className="topic-list">{courseModule.topics.map((topic, index) => {
      const done = completed.includes(topic.id);
      return <li key={topic.id}><Link to={ready ? `/aula/${topic.id}` : '#'} className={`topic-row${ready ? ' ready' : ' planned'}`} aria-disabled={!ready} onClick={(event) => { if (!ready) event.preventDefault(); }}>
        <span className={`topic-number${done ? ' done' : ''}`}>{done ? <Check size={16} /> : String(index + 1).padStart(2, '0')}</span><span className="topic-title">{topic.title}</span><span className="topic-status">{done ? 'Concluída' : ready ? 'Aula' : 'Em preparação'}</span>{ready ? <ChevronRight size={17} /> : <LockKeyhole size={15} />}
      </Link></li>;
    })}</ol>
    <div className="module-quiz-wrap"><ModuleQuiz moduleId={courseModule.id} /></div>
    <Link to={`/nivel/${courseModule.level.id}`} className="button button-soft back-button"><ArrowLeft size={15} /> Voltar ao nível</Link>
  </div>;
}

export function LessonPage() {
  const { topicId = '' } = useParams();
  const topic = findTopic(topicId);
  const navigate = useNavigate();
  const { completed, toggleCompleted, checks, toggleCheck } = useProgress();
  const { videos, loading } = useVideoCatalog();
  const sequence = useMemo(() => allTopics.filter((item) => item.module.number <= 10), []);
  if (!topic || !contentReady(topic.module.number)) return <NotFoundPage />;
  const lesson = getLesson(topic.id);
  const position = sequence.findIndex((item) => item.id === topic.id);
  const previous = sequence[position - 1];
  const next = sequence[position + 1];
  const isLastInModule = topic.module.topics.at(-1)?.id === topic.id;
  const done = completed.includes(topic.id);
  const videoForTopic = videos.filter((video) => video.topicId === topic.id).slice(0, 3);
  const highlight = lesson?.highlight ?? topicHighlights[topic.id] ?? [];

  return <div className="page-stack lesson-page">
    <div className="course-breadcrumb"><Link to="/trilha">Mapa</Link><ChevronRight size={14} /><Link to={`/nivel/${topic.level.id}`}>Nível {topic.level.number}</Link><ChevronRight size={14} /><Link to={`/modulo/${topic.module.id}`}>Módulo {topic.module.number}</Link></div>
    <div className="lesson-layout">
      <aside className="lesson-rail"><div className="lesson-rail-section"><span className="eyebrow">NESTE MÓDULO</span><strong>{topic.module.title}</strong></div><ol>{topic.module.topics.map((item, index) => <li key={item.id}><Link to={`/aula/${item.id}`} className={`${item.id === topic.id ? 'current' : ''}${completed.includes(item.id) ? ' done' : ''}`}><span>{completed.includes(item.id) ? <Check size={12} /> : String(index + 1).padStart(2, '0')}</span><span>{item.title}</span></Link></li>)}</ol><div className="lesson-rail-progress"><span>Seu módulo</span><ProgressBar value={Math.round(topic.module.topics.filter((item) => completed.includes(item.id)).length / topic.module.topics.length * 100)} compact /></div></aside>
      <article className="lesson-content">
        <header className="lesson-header"><span className="eyebrow">NÍVEL {topic.level.number} <span className="footer-dot">·</span> MÓDULO {String(topic.module.number).padStart(2, '0')} <span className="footer-dot">·</span> TÓPICO {String(topic.module.topics.findIndex((item) => item.id === topic.id) + 1).padStart(2, '0')}</span><h1>{topic.title}<em>.</em></h1><div className="lesson-meta"><span><Clock3 size={14} /> 5–10 min</span><span><Music2 size={14} /> Prática guiada</span></div></header>
        <section className="lesson-explanation"><h2>Vamos entender</h2><p>{lesson?.explanation}</p><div className="example-callout"><span className="callout-label">EXEMPLO</span><p>{lesson?.example}</p></div></section>
        <section className="lesson-keyboard-section"><div className="lesson-section-heading"><div><span className="eyebrow">EXPERIMENTE</span><h2>Toque e escute.</h2></div><span className="optional-label">NO TECLADO VIRTUAL</span></div><PianoKeyboard highlight={highlight} /></section>
        <section className="lesson-exercises"><div className="lesson-section-heading"><div><span className="eyebrow">MÃOS ÀS TECLAS</span><h2>Experimente agora.</h2></div><span className="exercise-count">{lesson?.exercises.length ?? 0} exercícios</span></div><ol className="exercise-list">{lesson?.exercises.map((exercise, index) => <li key={exercise}><span className="exercise-no">{String(index + 1).padStart(2, '0')}</span><p>{exercise}</p></li>)}</ol></section>
        <section className="checklist-section"><div className="lesson-section-heading"><div><span className="eyebrow">ANTES DE SEGUIR</span><h2>Domine antes de avançar.</h2></div></div><div className="checklist-items">{lesson?.checklist.map((item) => <label key={item} className="checklist-item"><input type="checkbox" checked={checks[topic.id]?.includes(item) ?? false} onChange={() => toggleCheck(topic.id, item)} /><span className="checkmark"><Check size={13} /></span><span>{item}</span></label>)}</div><button type="button" className={`button ${done ? 'button-completed' : 'button-primary'} complete-button`} onClick={() => toggleCompleted(topic.id)}>{done ? <><Check size={16} /> Aula concluída</> : <>Marcar como concluída <Check size={16} /></>}</button></section>
        <section className="videos-section"><div className="lesson-section-heading"><div><span className="eyebrow">OUÇA OUTRA EXPLICAÇÃO</span><h2>Vídeos selecionados.</h2><p>Escolhidos por didática e clareza — não apenas pela popularidade.</p></div></div>{loading ? <p className="empty-state">Carregando a curadoria…</p> : videoForTopic.length ? <div className="video-list">{videoForTopic.map((video, index) => <VideoEmbed key={`${video.url}-${index}`} video={video} />)}</div> : <div className="video-placeholder"><CirclePlay size={22} /><div><strong>Curadoria deste tópico em preparação.</strong><p>Os vídeos serão inseridos no arquivo de dados sem alterar as aulas.</p></div><Link to="/curadoria" className="text-link">Saiba como <ArrowRight size={14} /></Link></div>}</section>
        <nav className="lesson-pagination" aria-label="Navegação entre aulas"><button type="button" className="button button-soft" disabled={!previous} onClick={() => previous && navigate(`/aula/${previous.id}`)}><ArrowLeft size={15} /><span><small>ANTERIOR</small>{previous?.title ?? 'Início do caminho'}</span></button><button type="button" className="button button-next" disabled={!next} onClick={() => next && navigate(`/aula/${next.id}`)}><span><small>PRÓXIMA AULA</small>{next?.title ?? 'Último tópico disponível'}</span><ArrowRight size={15} /></button></nav>
      </article>
    </div>
    {isLastInModule && <div className="module-quiz-wrap lesson-quiz"><ModuleQuiz moduleId={topic.module.id} /></div>}
  </div>;
}

export function NotFoundPage() {
  return <div className="not-found"><span className="eyebrow">OPA, ESSA PÁGINA NÃO ESTÁ NA PARTITURA</span><h1>Vamos encontrar outro caminho.</h1><p>O endereço pode estar incompleto ou o conteúdo ainda não foi preparado.</p><Link to="/trilha" className="button button-primary">Voltar para a trilha <ArrowRight size={16} /></Link></div>;
}
