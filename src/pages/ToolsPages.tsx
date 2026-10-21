import { useMemo, useState, type ChangeEvent } from 'react';
import { ArrowRight, Check, Compass, Download, FileUp, Piano, RotateCcw, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { allModules, allTopics, contentReady } from '../data/curriculum';
import { glossary } from '../data/glossary';
import { useVideoCatalog } from '../hooks/useVideoCatalog';
import { isVideoCatalog, type VideoItem } from '../data/videoTypes';
import { PianoKeyboard } from '../components/PianoKeyboard';
import { Metronome } from '../components/Metronome';
import { VideoEmbed } from '../components/VideoEmbed';

const levelQuestions = [
  { prompt: 'Você encontra as notas no teclado sem contar uma por uma?', no: 3 },
  { prompt: 'Você reconhece ou lê cifras como C, G e Am?', no: 7 },
  { prompt: 'Você consegue tocar escalas maiores com uma digitação confortável?', no: 8 },
  { prompt: 'Você monta tríades maiores e menores e reconhece inversões?', no: 10 },
  { prompt: 'Você acompanha músicas com acordes de sétima ou padrões de mão esquerda?', no: 11 },
];

const normalizeTerm = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function LevelTestPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(levelQuestions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const progress = answers.filter((item) => item !== null).length;
  const firstNo = answers.findIndex((answer) => answer === false);
  const entry = firstNo === -1 ? 11 : levelQuestions[firstNo]?.no ?? 3;
  const courseModule = allModules.find((module) => module.number === entry) ?? allModules[0];
  const firstAvailable = courseModule.topics[0];
  const reset = () => { setAnswers(Array(levelQuestions.length).fill(null)); setShowResult(false); };
  return <div className="page-stack tool-page">
    <div className="page-intro"><span className="eyebrow">PONTO DE PARTIDA</span><h1>Onde você <em>quer continuar?</em></h1><p>Este teste curto não é uma prova. Ele só ajuda a encontrar assuntos que valem uma revisão.</p></div>
    {!showResult ? <section className="level-test-card"><div className="test-progress"><span>{progress} de {levelQuestions.length} respostas</span><span>{Math.round(progress / levelQuestions.length * 100)}%</span></div><div className="test-progress-track"><i style={{ width: `${progress / levelQuestions.length * 100}%` }} /></div><div className="test-questions">{levelQuestions.map((question, index) => <div className={`test-question${answers[index] !== null ? ' answered' : ''}`} key={question.prompt}><span className="test-no">{String(index + 1).padStart(2, '0')}</span><div><h2>{question.prompt}</h2><div className="test-answer-row"><button type="button" className={answers[index] === true ? 'selected' : ''} onClick={() => setAnswers((current) => current.map((value, i) => i === index ? true : value))}><Check size={14} /> Sim, com alguma segurança</button><button type="button" className={answers[index] === false ? 'selected' : ''} onClick={() => setAnswers((current) => current.map((value, i) => i === index ? false : value))}>Quero revisar</button></div></div></div>)}</div><div className="test-actions"><span>Escolha “Quero revisar” quando quiser reforçar a base.</span><button type="button" className="button button-primary" disabled={answers.some((answer) => answer === null)} onClick={() => setShowResult(true)}>Ver meu ponto de partida <ArrowRight size={15} /></button></div></section> : <section className="test-result-card"><span className="result-icon"><Compass size={22} /></span><span className="eyebrow">SUGESTÃO DE PARTIDA</span><h2>{firstNo === -1 ? 'Pronto para explorar harmonia e acompanhamento.' : `Uma boa revisão começa em ${courseModule.title.toLocaleLowerCase('pt-BR')}.`}</h2><p>A trilha continua disponível desde o início. Esta sugestão não bloqueia nenhum módulo e não marca aulas como concluídas.</p><div className="suggested-module"><span className="suggested-no">MÓDULO {String(courseModule.number).padStart(2, '0')}</span><strong>{courseModule.title}</strong><span>{courseModule.level.title}</span></div><div className="result-actions"><button type="button" className="button button-primary" onClick={() => navigate(contentReady(courseModule.number) ? `/aula/${firstAvailable.id}` : `/modulo/${courseModule.id}`)}>Ir para a sugestão <ArrowRight size={15} /></button><button type="button" className="button button-soft" onClick={reset}><RotateCcw size={15} /> Fazer novamente</button></div></section>}
    <aside className="test-note"><Sparkles size={16} /><p>Você também pode explorar o mapa e escolher outro tópico. Não existe jeito errado de recomeçar.</p><Link to="/trilha">Abrir o mapa <ArrowRight size={14} /></Link></aside>
  </div>;
}

export function GlossaryPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => glossary.filter((entry) => normalizeTerm(`${entry.term} ${entry.definition} ${entry.group}`).includes(normalizeTerm(query))).sort((a, b) => a.term.localeCompare(b.term, 'pt-BR')), [query]);
  const groups = useMemo(() => [...new Set(filtered.map((entry) => entry.group))], [filtered]);
  return <div className="page-stack tool-page glossary-page"><div className="page-intro"><span className="eyebrow">CONSULTA RÁPIDA</span><h1>Palavras que <em>fazem música.</em></h1><p>Um glossário sem complicação. Os termos aparecem também com explicação nas aulas.</p></div><div className="glossary-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar uma palavra ou conceito..." aria-label="Buscar no glossário" /><span>{filtered.length} termos</span></div>{groups.length ? groups.map((group) => <section className="glossary-group" key={group}><div className="glossary-group-heading"><span className="eyebrow">{group.toLocaleUpperCase('pt-BR')}</span><i /></div><div className="glossary-entries">{filtered.filter((entry) => entry.group === group).map((entry) => <article className="glossary-entry" key={entry.term}><h2>{entry.term}</h2><p>{entry.definition}</p></article>)}</div></section>) : <p className="empty-state">Não encontrei esse termo. Experimente buscar por outra palavra.</p>}<aside className="glossary-note"><Piano size={18} /><p>Viu uma palavra nova? A busca aceita partes do termo e da explicação.</p></aside></div>;
}

export function PracticePage() {
  return <div className="page-stack tool-page practice-page"><div className="page-intro"><span className="eyebrow">PAUSA PARA PRATICAR</span><h1>Seu teclado, <em>sem compromisso.</em></h1><p>Toque uma nota para ouvir o som, experimente uma sequência e use o metrônomo para encontrar seu pulso.</p></div><div className="practice-grid"><section className="practice-keyboard-card"><div className="tool-card-header"><span className="tool-icon"><Piano size={19} /></span><div><span className="eyebrow">TECLADO VIRTUAL</span><h2>Toque e descubra.</h2></div></div><p>Clique ou toque em qualquer tecla. O som é sintetizado neste dispositivo e não é gravado.</p><PianoKeyboard /><div className="practice-tip"><Sparkles size={15} />O teclado mostra duas oitavas para você experimentar notas próximas.</div></section><Metronome /></div><section className="practice-ideas"><span className="eyebrow">UMA IDEIA SIMPLES</span><h2>Explore sem buscar a nota “certa”.</h2><p>Toque duas notas diferentes, escute a distância entre elas e experimente tocá-las juntas. Esse tipo de curiosidade também é prática.</p></section></div>;
}

function downloadJson(videos: VideoItem[]) {
  const blob = new Blob([JSON.stringify(videos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'videos-trilha-do-teclado.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CurationPage() {
  const { videos, loading, error, save } = useVideoCatalog();
  const [importMessage, setImportMessage] = useState('');
  const topicsWithContent = allTopics.filter((topic) => topic.module.number <= 10);
  const filledTopicIds = new Set(videos.map((video) => video.topicId));
  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isVideoCatalog(parsed)) throw new Error('Confira os campos, IDs de tópicos, links do YouTube e o limite de três vídeos por tópico.');
      save(parsed as VideoItem[]);
      setImportMessage(`${parsed.length} vídeo(s) carregados neste navegador.`);
    } catch (cause) {
      setImportMessage(cause instanceof Error ? cause.message : 'Não foi possível ler o arquivo.');
    }
    event.target.value = '';
  };
  return <div className="page-stack tool-page curation-page"><div className="page-intro"><span className="eyebrow">DADOS EDITÁVEIS</span><h1>Vídeos escolhidos <em>com cuidado.</em></h1><p>Uma curadoria transparente, sem ranking automático. O arquivo dos vídeos pode ser trocado sem mexer nas páginas ou componentes.</p></div>
    <section className="curation-principles"><div><span className="curation-index">01</span><strong>Didática do professor</strong><p>Clareza e sequência de explicação são o critério principal.</p></div><div><span className="curation-index">02</span><strong>Áudio e imagem</strong><p>O exemplo precisa ser audível e fácil de acompanhar.</p></div><div><span className="curation-index">03</span><strong>Comentários e avaliações</strong><p>São contexto quando acessíveis, nunca uma garantia de qualidade.</p></div><div><span className="curation-index">04</span><strong>Visualizações</strong><p>Critério secundário: alcance não comprova didática.</p></div></section>
    <div className="curation-toolbar"><div><span className="curation-total">{loading ? 'Carregando…' : `${videos.length} vídeos cadastrados`}</span><span className="curation-subtotal">{filledTopicIds.size} de {topicsWithContent.length} tópicos com vídeo</span></div><div className="curation-actions"><label className="button button-soft file-button"><FileUp size={15} /> Importar JSON<input type="file" accept="application/json,.json" onChange={(event) => void handleImport(event)} /></label><button type="button" className="button button-primary" onClick={() => downloadJson(videos)}><Download size={15} /> Exportar JSON</button></div></div>
    {importMessage && <div className="import-message">{importMessage}</div>}{error && <div className="import-message">{error}</div>}
    {!loading && videos.length > 0 ? <div className="curation-list">{topicsWithContent.map((topic) => {
      const items = videos.filter((video) => video.topicId === topic.id).slice(0, 3);
      if (!items.length) return null;
      return <details key={topic.id} className="curation-topic"><summary><span><span className="eyebrow">MÓDULO {topic.module.number}</span><strong>{topic.title}</strong></span><span className="video-count">{items.length} vídeo(s)</span></summary><div className="curation-topic-content">{items.map((video, index) => <VideoEmbed key={`${video.url}-${index}`} video={video} />)}</div></details>;
    })}</div> : !loading && <div className="curation-empty"><FileUp size={24} /><h2>A curadoria está sendo preparada.</h2><p>Quando um vídeo for selecionado, os dados aparecem em <code>public/data/videos.json</code> com tópico, título, canal, link, selo e nota de curadoria.</p><div className="curation-empty-stats"><span><strong>{topicsWithContent.length}</strong> tópicos disponíveis nos dois primeiros níveis</span><span><strong>1–3</strong> vídeos previstos por tópico</span></div></div>}
    <aside className="curation-hint"><Sparkles size={15} /><p>Importar ou exportar aplica alterações ao seu navegador e gera um arquivo de dados. Para atualizar o site para todos, substitua <code>public/data/videos.json</code> no projeto.</p></aside>
  </div>;
}
