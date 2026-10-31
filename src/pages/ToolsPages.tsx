import { useMemo, useState } from 'react';
import { ArrowRight, Check, Compass, Piano, RotateCcw, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourseContent } from '../context/CourseContentContext';
import { PianoKeyboard } from '../components/PianoKeyboard';
import { Metronome } from '../components/Metronome';
import { VideoEmbed } from '../components/VideoEmbed';
import { CourseContentState } from '../components/CourseContentState';

const levelQuestions = [
  { prompt: 'Você encontra as notas no teclado sem contar uma por uma?', no: 3 },
  { prompt: 'Você reconhece ou lê cifras como C, G e Am?', no: 7 },
  { prompt: 'Você consegue tocar escalas maiores com uma digitação confortável?', no: 8 },
  { prompt: 'Você monta tríades maiores e menores e reconhece inversões?', no: 10 },
  { prompt: 'Você reconhece o campo harmônico e progressões como I–IV–V?', no: 11 },
  { prompt: 'Você monta acordes com sétima e toca uma progressão ii–V–I?', no: 12 },
  { prompt: 'Você usa extensões, acordes emprestados ou dominantes secundários?', no: 13 },
  { prompt: 'Você acompanha uma música com padrões de baixo e acordes?', no: 14 },
  { prompt: 'Você coordena arpejos, articulação e pedal com conforto?', no: 15 },
];

const normalizeTerm = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function LevelTestPage() {
  const navigate = useNavigate();
  const { allModules, loading, error, reload } = useCourseContent();
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(levelQuestions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const progress = answers.filter((item) => item !== null).length;
  const firstNo = answers.findIndex((answer) => answer === false);
  const targetNumber = firstNo === -1 ? 11 : levelQuestions[firstNo]?.no ?? allModules[0]?.number;
  const courseModule = allModules.find((module) => module.number >= (targetNumber ?? 0)) ?? allModules.at(-1);
  const firstAvailable = courseModule?.topics.find((topic) => topic.lesson);
  const reset = () => { setAnswers(Array(levelQuestions.length).fill(null)); setShowResult(false); };
  if (loading || error) return <div className="page-stack tool-page"><CourseContentState loading={loading} error={error} reload={reload} /></div>;
  return <div className="page-stack tool-page">
    <div className="page-intro"><span className="eyebrow">PONTO DE PARTIDA</span><h1>Onde você <em>quer continuar?</em></h1><p>Este teste curto não é uma prova. Ele só ajuda a encontrar assuntos que valem uma revisão.</p></div>
    {!courseModule ? <section className="curation-empty"><Compass size={24} /><h2>Ainda não há módulos publicados.</h2><p>Volte mais tarde para encontrar um ponto de partida na trilha.</p><Link to="/trilha" className="text-link">Abrir o mapa <ArrowRight size={14} /></Link></section> : !showResult ? <section className="level-test-card"><div className="test-progress"><span>{progress} de {levelQuestions.length} respostas</span><span>{Math.round(progress / levelQuestions.length * 100)}%</span></div><div className="test-progress-track"><i style={{ width: `${progress / levelQuestions.length * 100}%` }} /></div><div className="test-questions">{levelQuestions.map((question, index) => <div className={`test-question${answers[index] !== null ? ' answered' : ''}`} key={question.prompt}><span className="test-no">{String(index + 1).padStart(2, '0')}</span><div><h2>{question.prompt}</h2><div className="test-answer-row"><button type="button" className={answers[index] === true ? 'selected' : ''} onClick={() => setAnswers((current) => current.map((value, i) => i === index ? true : value))}><Check size={14} /> Sim, com alguma segurança</button><button type="button" className={answers[index] === false ? 'selected' : ''} onClick={() => setAnswers((current) => current.map((value, i) => i === index ? false : value))}>Quero revisar</button></div></div></div>)}</div><div className="test-actions"><span>Escolha “Quero revisar” quando quiser reforçar a base.</span><button type="button" className="button button-primary" disabled={answers.some((answer) => answer === null)} onClick={() => setShowResult(true)}>Ver meu ponto de partida <ArrowRight size={15} /></button></div></section> : <section className="test-result-card"><span className="result-icon"><Compass size={22} /></span><span className="eyebrow">SUGESTÃO DE PARTIDA</span><h2>{firstNo === -1 ? 'Pronto para aprofundar harmonia, acompanhamento e técnica.' : `Uma boa revisão começa em ${courseModule.title.toLocaleLowerCase('pt-BR')}.`}</h2><p>A trilha continua disponível desde o início. Esta sugestão não bloqueia nenhum módulo e não marca aulas como concluídas.</p><div className="suggested-module"><span className="suggested-no">MÓDULO {String(courseModule.number).padStart(2, '0')}</span><strong>{courseModule.title}</strong><span>{courseModule.level.title}</span></div><div className="result-actions"><button type="button" className="button button-primary" onClick={() => navigate(firstAvailable ? `/aula/${firstAvailable.id}` : `/modulo/${courseModule.id}`)}>Ir para a sugestão <ArrowRight size={15} /></button><button type="button" className="button button-soft" onClick={reset}><RotateCcw size={15} /> Fazer novamente</button></div></section>}
    <aside className="test-note"><Sparkles size={16} /><p>Você também pode explorar o mapa e escolher outro tópico. Não existe jeito errado de recomeçar.</p><Link to="/trilha">Abrir o mapa <ArrowRight size={14} /></Link></aside>
  </div>;
}

export function GlossaryPage() {
  const { glossary, loading, error, reload } = useCourseContent();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => glossary.filter((entry) => normalizeTerm(`${entry.term} ${entry.definition} ${entry.group}`).includes(normalizeTerm(query))).sort((a, b) => a.term.localeCompare(b.term, 'pt-BR')), [glossary, query]);
  const groups = useMemo(() => [...new Set(filtered.map((entry) => entry.group))], [filtered]);
  if (loading || error) return <div className="page-stack tool-page"><CourseContentState loading={loading} error={error} reload={reload} /></div>;
  return <div className="page-stack tool-page glossary-page"><div className="page-intro"><span className="eyebrow">CONSULTA RÁPIDA</span><h1>Palavras que <em>fazem música.</em></h1><p>Um glossário sem complicação. Os termos aparecem também com explicação nas aulas.</p></div><div className="glossary-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar uma palavra ou conceito..." aria-label="Buscar no glossário" /><span>{filtered.length} termos</span></div>{groups.length ? groups.map((group) => <section className="glossary-group" key={group}><div className="glossary-group-heading"><span className="eyebrow">{group.toLocaleUpperCase('pt-BR')}</span><i /></div><div className="glossary-entries">{filtered.filter((entry) => entry.group === group).map((entry) => <article className="glossary-entry" key={entry.id}><h2>{entry.term}</h2><p>{entry.definition}</p></article>)}</div></section>) : <p className="empty-state">{glossary.length ? 'Não encontrei esse termo. Experimente buscar por outra palavra.' : 'Ainda não há termos publicados no glossário.'}</p>}<aside className="glossary-note"><Piano size={18} /><p>Viu uma palavra nova? A busca aceita partes do termo e da explicação.</p></aside></div>;
}

export function PracticePage() {
  return <div className="page-stack tool-page practice-page"><div className="page-intro"><span className="eyebrow">PAUSA PARA PRATICAR</span><h1>Seu teclado, <em>sem compromisso.</em></h1><p>Toque uma nota para ouvir o som, experimente uma sequência e use o metrônomo para encontrar seu pulso.</p></div><div className="practice-grid"><section className="practice-keyboard-card"><div className="tool-card-header"><span className="tool-icon"><Piano size={19} /></span><div><span className="eyebrow">TECLADO VIRTUAL</span><h2>Toque e descubra.</h2></div></div><p>Clique ou toque em qualquer tecla. O som é sintetizado neste dispositivo e não é gravado.</p><PianoKeyboard /><div className="practice-tip"><Sparkles size={15} />O teclado mostra duas oitavas para você experimentar notas próximas.</div></section><Metronome /></div><section className="practice-ideas"><span className="eyebrow">UMA IDEIA SIMPLES</span><h2>Explore sem buscar a nota “certa”.</h2><p>Toque duas notas diferentes, escute a distância entre elas e experimente tocá-las juntas. Esse tipo de curiosidade também é prática.</p></section></div>;
}

export function CurationPage() {
  const { allModules, loading, error, reload } = useCourseContent();
  const videoCount = allModules.reduce((sum, module) => sum + module.topics.reduce((topicSum, topic) => topicSum + topic.videos.length, 0), 0);
  const topicsWithVideos = allModules.reduce((sum, module) => sum + module.topics.filter((topic) => topic.videos.length > 0).length, 0);
  if (loading || error) return <div className="page-stack tool-page"><CourseContentState loading={loading} error={error} reload={reload} /></div>;
  const modulesWithVideos = allModules.map((module) => ({ ...module, topicsWithVideos: module.topics.filter((topic) => topic.videos.length > 0) })).filter((module) => module.topicsWithVideos.length > 0);
  return <div className="page-stack tool-page curation-page"><div className="page-intro"><span className="eyebrow">CURADORIA TRANSPARENTE</span><h1>Vídeos escolhidos <em>com cuidado.</em></h1><p>Uma curadoria transparente, sem ranking automático. Os vídeos publicados são selecionados com critérios claros e aparecem vinculados ao tópico correspondente.</p></div>
    <section className="curation-principles"><div><span className="curation-index">01</span><strong>Didática do professor</strong><p>Clareza e sequência de explicação são o critério principal.</p></div><div><span className="curation-index">02</span><strong>Áudio e imagem</strong><p>O exemplo precisa ser audível e fácil de acompanhar.</p></div><div><span className="curation-index">03</span><strong>Comentários e avaliações</strong><p>São contexto quando acessíveis, nunca uma garantia de qualidade.</p></div><div><span className="curation-index">04</span><strong>Visualizações</strong><p>Critério secundário: alcance não comprova didática.</p></div></section>
    <div className="curation-toolbar"><div><span className="curation-total">{videoCount} vídeos publicados</span><span className="curation-subtotal">{topicsWithVideos} tópicos com vídeo</span></div></div>
    {modulesWithVideos.length ? <div className="curation-list">{modulesWithVideos.map((module) => <section key={module.id} className="curation-module"><div className="curation-module-heading"><span className="eyebrow">MÓDULO {String(module.number).padStart(2, '0')}</span><h2>{module.title}</h2><small>{module.level.title}</small></div>{module.topicsWithVideos.map((topic) => <details key={topic.id} className="curation-topic"><summary><span><span className="eyebrow">{topic.title}</span><strong>{topic.videos.length} vídeo(s)</strong></span><span className="video-count">Ver seleção</span></summary><div className="curation-topic-content">{topic.videos.map((video) => <VideoEmbed key={video.id} video={video} />)}</div></details>)}</section>)}</div> : <div className="curation-empty"><Sparkles size={24} /><h2>A curadoria está sendo preparada.</h2><p>Quando vídeos forem publicados, eles aparecerão aqui agrupados por módulo e tópico, com os respectivos critérios de seleção.</p><div className="curation-empty-stats"><span><strong>{allModules.length}</strong> módulos publicados verificados</span><span><strong>0</strong> tópicos com vídeo publicado</span></div></div>}
  </div>;
}
