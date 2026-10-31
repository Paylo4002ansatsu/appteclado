import { useEffect, useState } from 'react';
import { ArrowLeft, Music2, PlayCircle } from 'lucide-react';
import type { AdminModuleRecord } from '../data/courseTypes';
import { getModule } from '../lib/adminApi';
import { YoutubeClickToLoad } from '../components/YoutubeClickToLoad';

export function AdminPreviewPage({ moduleId, onBack }: { moduleId: string; onBack: () => void }) {
  const [record, setRecord] = useState<AdminModuleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let current = true;
    setLoading(true); setError(''); setRecord(null);
    getModule(moduleId).then((value) => { if (current) setRecord(value); }).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar o rascunho.'); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [moduleId]);
  if (loading) return <section className="admin-panel"><p role="status">Carregando pré-visualização…</p></section>;
  if (error || !record) return <section className="admin-panel"><button className="button button-soft" type="button" onClick={onBack}><ArrowLeft size={15} /> Voltar</button><p className="admin-message admin-message-error" role="alert">{error || 'Módulo não encontrado.'}</p></section>;
  const draft = record.draftContent;
  return <section className="admin-preview">
    <div className="admin-preview-toolbar"><button className="button button-soft" type="button" onClick={onBack}><ArrowLeft size={15} /> Voltar ao painel</button><span className="admin-badge draft">Prévia privada · rascunho não publicado</span>{record.isPublished && <span className="admin-badge pending">A versão pública não foi alterada</span>}</div>
    <header className="admin-preview-hero"><span className="admin-eyebrow">NÍVEL {record.levelId.replace(/^n/, '')} · MÓDULO {record.number}</span><h1>{draft.title || 'Módulo sem título'}</h1><p>{draft.description || 'Sem introdução cadastrada.'}</p></header>
    {draft.topics.map((topic, index) => <article className="admin-preview-topic" key={topic.id}><span className="admin-eyebrow">TÓPICO {String(index + 1).padStart(2, '0')}</span><h2>{topic.title || 'Tópico sem título'}</h2>{topic.lesson?.explanation && <section><h3>Sobre a aula</h3><p>{topic.lesson.explanation}</p></section>}{topic.lesson?.example && <section className="admin-preview-example"><h3>Exemplo</h3><p>{topic.lesson.example}</p></section>}{topic.lesson?.exercises?.length ? <section><h3>Experimente</h3><ul>{topic.lesson.exercises.filter(Boolean).map((exercise, i) => <li key={`${i}-${exercise}`}>{exercise}</li>)}</ul></section> : null}{topic.lesson?.checklist?.length ? <section><h3>Checklist</h3><ul>{topic.lesson.checklist.filter(Boolean).map((item, i) => <li key={`${i}-${item}`}>{item}</li>)}</ul></section> : null}{topic.highlight?.length > 0 && <p className="admin-preview-highlight"><Music2 size={16} /> Teclas em destaque: {topic.highlight.join(', ')}</p>}
      {topic.chordLesson && <section className="admin-preview-chord"><h3><Music2 size={17} /> Atividade de teclado</h3><p>{topic.chordLesson.prompt}</p>{topic.chordLesson.playSequenceLabel && <small>Sequência: {topic.chordLesson.playSequenceLabel}</small>}{topic.chordLesson.options.map((option) => <div className="admin-preview-chord-option" key={option.id}><strong>{option.label || option.id}</strong>{option.group && <span>{option.group}</span>}<p>Notas: {option.notes.join(', ') || '—'}</p><p>MIDI: {option.midi.join(', ') || '—'} · Arpejo: {option.arpeggioMidi.join(', ') || '—'}</p></div>)}</section>}
      {topic.videos.length > 0 && <section><h3>Vídeos selecionados</h3><div className="admin-preview-videos">{topic.videos.map((video) => { const id = previewYoutubeId(video.url); return <article className="admin-preview-video" key={video.id}>{id ? <div className="admin-video-frame"><YoutubeClickToLoad id={id} title={video.title || 'Vídeo sem título'} channel={video.channel || undefined} /></div> : <div className="admin-preview-invalid"><PlayCircle size={21} /> Link de vídeo inválido</div>}<h4>{video.title || 'Vídeo sem título'}</h4><p>{video.description}</p><small>{video.channel}{video.durationSeconds != null ? ` · ${Math.floor(video.durationSeconds / 60)}:${String(video.durationSeconds % 60).padStart(2, '0')}` : ''}</small></article>; })}</div></section>}
    </article>)}
    {draft.quiz.length > 0 && <section className="admin-preview-topic"><span className="admin-eyebrow">REVISÃO</span><h2>Questionário do módulo</h2>{draft.quiz.map((question, index) => <article className="admin-preview-quiz" key={`q-${index}`}><h3>{index + 1}. {question.prompt}</h3><ul>{question.options.map((option, i) => <li key={`${i}-${option}`}>{option}{i === question.answer ? ' · resposta correta' : ''}</li>)}</ul><p>{question.explanation}</p></article>)}</section>}
  </section>;
}
function previewYoutubeId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname.toLowerCase())) return null;
    const path = url.pathname.split('/').filter(Boolean);
    const id = url.hostname.toLowerCase() === 'youtu.be' ? path[0] : url.pathname === '/watch' ? url.searchParams.get('v') ?? '' : ['embed', 'shorts'].includes(path[0] ?? '') ? path[1] : '';
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
