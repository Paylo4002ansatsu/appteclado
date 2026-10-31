import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useMatch } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, Eye, FilePlus2, LogOut, Plus, Save, ShieldCheck, Trash2, Video } from 'lucide-react';
import type { AdminGlossaryRecord, AdminModuleRecord, AdminSessionResponse, ChordLessonConfig, ChordOption, ContentReadiness, CourseTopicData, GlossaryDraftContent, ModuleSnapshot, QuizQuestion, VideoItem } from '../data/courseTypes';
import { useCourseContent } from '../context/CourseContentContext';
import * as api from '../lib/adminApi';
import { YoutubeClickToLoad } from '../components/YoutubeClickToLoad';
import { AdminPreviewPage } from './AdminPreviewPage';
import '../styles/admin.css';

const blankSnapshot = (): ModuleSnapshot => ({ title: '', description: '', topics: [], quiz: [] });
const makeId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
const levelName = (id: string) => `Nível ${id.replace(/^n/, '')}`;

export function parseYoutubeId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname.toLowerCase())) return null;
    let id = '';
    if (url.hostname.toLowerCase() === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] ?? '';
    else if (url.pathname === '/watch') id = url.searchParams.get('v') ?? '';
    else if (/^\/(embed|shorts)\//.test(url.pathname)) id = url.pathname.split('/')[2] ?? '';
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

function Message({ children, kind = 'info' }: { children: ReactNode; kind?: 'info' | 'error' | 'success' }) {
  return <div className={`admin-message admin-message-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>;
}
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
function TextList({ label, values, onChange, hint }: { label: string; values: string[]; onChange: (next: string[]) => void; hint?: string }) {
  return <Field label={label} hint={hint}><textarea value={values.join('\n')} onChange={(event) => onChange(event.target.value.split('\n'))} rows={Math.max(3, Math.min(7, values.length || 3))} /></Field>;
}

export function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const previewMatch = useMatch('/admin/preview/:moduleId');
  const [session, setSession] = useState<AdminSessionResponse | null>(null);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [working, setWorking] = useState(false);
  const checkSession = useCallback(async () => {
    setChecking(true); setAuthError('');
    try { const current = await api.getSession(); setSession(current); }
    catch (error) { setSession({ authenticated: false }); setAuthError(errorText(error)); }
    finally { setChecking(false); }
  }, []);
  useEffect(() => { void checkSession(); }, [checkSession]);

  async function submitLogin(event: FormEvent) {
    event.preventDefault(); setWorking(true); setAuthError('');
    try { const logged = await api.login(email, password); if (!logged.authenticated) throw new Error('Não foi possível iniciar a sessão. Confira suas credenciais.'); setSession(logged); setPassword(''); }
    catch (error) { setAuthError(errorText(error)); }
    finally { setWorking(false); }
  }
  async function doLogout() {
    setWorking(true); setAuthError('');
    try { await api.logout(); setSession({ authenticated: false }); navigate('/admin', { replace: true }); }
    catch (error) { setAuthError(errorText(error)); }
    finally { setWorking(false); }
  }

  if (checking) return <main className="admin-login-shell"><Message>Verificando sessão segura…</Message></main>;
  if (!session?.authenticated) return <main className="admin-login-shell"><section className="admin-login-card"><span className="admin-eyebrow"><ShieldCheck size={15} /> ÁREA EDITORIAL RESTRITA</span><h1>Acesso de administração</h1><p>Entre com sua conta autorizada para editar o conteúdo do curso.</p>{authError && <Message kind="error">{authError}</Message>}<form onSubmit={submitLogin} className="admin-form"><Field label="E-mail"><input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></Field><Field label="Senha"><input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></Field><button className="button button-primary" disabled={working}>{working ? 'Entrando…' : 'Entrar'}</button></form><Link className="admin-back-link" to="/">Voltar ao site</Link></section></main>;
  return <main className="admin-page"><header className="admin-top"><div><span className="admin-eyebrow"><ShieldCheck size={15} /> PAINEL EDITORIAL</span><h1>Trilha do Teclado <em>· CMS</em></h1><p>Sessão segura de {session.email ?? email}</p></div><button className="button button-soft" type="button" disabled={working} onClick={() => void doLogout()}><LogOut size={16} /> Sair</button></header>{authError && <Message kind="error">{authError}</Message>}{previewMatch?.params.moduleId ? <AdminPreviewPage moduleId={previewMatch.params.moduleId} onBack={() => navigate('/admin')} /> : <AdminWorkspace key={location.pathname} />}</main>;
}

function AdminWorkspace() {
  const { levels: courseLevels } = useCourseContent();
  const [tab, setTab] = useState<'modules' | 'glossary'>('modules');
  const [records, setRecords] = useState<AdminModuleRecord[]>([]);
  const [glossary, setGlossary] = useState<AdminGlossaryRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const refreshModules = useCallback(async () => { const result = await api.listModules(); setRecords(result); return result; }, []);
  const refreshGlossary = useCallback(async () => { setGlossary(await api.listGlossary()); }, []);
  useEffect(() => { let live = true; (async () => { setLoading(true); try { const [mods, terms] = await Promise.all([api.listModules(), api.listGlossary()]); if (live) { setRecords(mods); setGlossary(terms); } } catch (e) { if (live) setError(errorText(e)); } finally { if (live) setLoading(false); } })(); return () => { live = false; }; }, []);

  async function create() {
    setError(''); setNotice('');
    try { const created = await api.createModule(courseLevels[0]?.id ?? 'n1', 'planned'); await refreshModules(); setSelectedId(created.id); setNotice('Módulo criado como rascunho.'); }
    catch (e) { setError(errorText(e)); }
  }
  async function reorder(index: number, direction: -1 | 1) {
    const other = index + direction; if (other < 0 || other >= records.length) return;
    if (records[index]?.levelId !== records[other]?.levelId) { setError('Para mover um módulo entre níveis, edite o campo “Nível”. A reordenação por botões é feita dentro de cada nível.'); return; }
    const ordered = [...records]; [ordered[index], ordered[other]] = [ordered[other], ordered[index]];
    const counts = new Map<string, number>();
    const items = ordered.map((record) => { const sortOrder = (counts.get(record.levelId) ?? 0) + 1; counts.set(record.levelId, sortOrder); return { id: record.id, levelId: record.levelId, sortOrder }; });
    setError(''); try { await api.reorderModules(items); await refreshModules(); setNotice('Ordem dos módulos atualizada.'); } catch (e) { setError(errorText(e)); }
  }
  async function onSaved(record: AdminModuleRecord, message: string) { await refreshModules(); setSelectedId(record.id); setNotice(message); }
  async function remove(record: AdminModuleRecord) {
    if (!window.confirm(`Excluir “${record.draftContent.title || `Módulo ${record.number}`}”? Esta ação não pode ser desfeita.`)) return;
    setError(''); try { await api.deleteModule(record.id); setSelectedId(null); await refreshModules(); setNotice('Módulo excluído.'); } catch (e) { setError(errorText(e)); }
  }
  return <>
    <nav className="admin-tabs" aria-label="Seções administrativas"><button type="button" className={tab === 'modules' ? 'is-active' : ''} onClick={() => { setTab('modules'); setSelectedId(null); }}><BookOpen size={16} /> Módulos</button><button type="button" className={tab === 'glossary' ? 'is-active' : ''} onClick={() => { setTab('glossary'); setSelectedId(null); }}><BookOpen size={16} /> Glossário</button></nav>
    {error && <Message kind="error">{error}</Message>}{notice && <Message kind="success">{notice}</Message>}
    {tab === 'modules' ? loading ? <Message>Carregando módulos…</Message> : selectedId ? <ModuleEditor key={selectedId} modules={records} record={records.find((item) => item.id === selectedId) ?? null} onSaved={onSaved} onCancel={() => setSelectedId(null)} onDeleted={async () => { setSelectedId(null); await refreshModules(); }} /> : <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">CONTEÚDO DO CURSO</span><h2>Módulos</h2><p>Rascunhos e versões publicadas, na ordem do percurso.</p></div><button className="button button-primary" type="button" onClick={() => void create()}><FilePlus2 size={16} /> Novo módulo</button></div>{records.length === 0 ? <p className="admin-empty">Ainda não há módulos cadastrados.</p> : <div className="admin-module-list">{records.map((record, index) => <article className="admin-module-row" key={record.id}><div className="admin-order-controls"><button type="button" aria-label={`Mover ${record.draftContent.title} para cima`} disabled={index === 0} onClick={() => void reorder(index, -1)}><ArrowUp size={15} /></button><span>{String(index + 1).padStart(2, '0')}</span><button type="button" aria-label={`Mover ${record.draftContent.title} para baixo`} disabled={index === records.length - 1} onClick={() => void reorder(index, 1)}><ArrowDown size={15} /></button></div><div className="admin-module-summary"><strong>{record.draftContent.title || `Módulo ${record.number} · sem título`}</strong><span>{levelName(record.levelId)} · Ordem {record.sortOrder} · {record.readiness === 'ready' ? 'Conteúdo pronto' : 'Planejado'}</span><div className="admin-badges"><span className={record.isPublished ? 'admin-badge published' : 'admin-badge draft'}>{record.isPublished ? 'Publicado' : 'Rascunho'}</span>{record.hasPendingChanges && <span className="admin-badge pending">Alterações pendentes</span>}</div></div><div className="admin-module-actions">{record.isPublished ? <a className="button button-soft" href={`/modulo/${encodeURIComponent(record.id)}`} target="_blank" rel="noreferrer"><Eye size={15} /> Ver no site</a> : <a className="button button-soft" href={`/admin/preview/${encodeURIComponent(record.id)}`} target="_blank" rel="noreferrer"><Eye size={15} /> Pré-visualizar</a>}<button className="button button-soft" type="button" onClick={() => setSelectedId(record.id)}>Editar</button><button className="admin-icon-danger" type="button" aria-label={`Excluir ${record.draftContent.title}`} onClick={() => void remove(record)}><Trash2 size={16} /></button></div></article>)}</div>}</section> : loading ? <Message>Carregando glossário…</Message> : <GlossaryEditor entries={glossary} onRefresh={refreshGlossary} onError={setError} onNotice={setNotice} />}
  </>;
}

function ModuleEditor({ record, modules, onSaved, onCancel, onDeleted }: { record: AdminModuleRecord | null; modules: AdminModuleRecord[]; onSaved: (record: AdminModuleRecord, message: string) => Promise<void>; onCancel: () => void; onDeleted: () => Promise<void> }) {
  const { levels: courseLevels } = useCourseContent();
  const [snapshot, setSnapshot] = useState<ModuleSnapshot>(() => record ? structuredClone(record.draftContent) : blankSnapshot());
  const [levelId, setLevelId] = useState(record?.levelId ?? courseLevels[0]?.id ?? 'n1');
  const [number, setNumber] = useState(record?.number ?? Math.max(0, ...modules.map((item) => item.number)) + 1);
  const [sortOrder, setSortOrder] = useState(record?.sortOrder ?? Math.max(0, ...modules.filter((item) => item.levelId === (courseLevels[0]?.id ?? 'n1')).map((item) => item.sortOrder)) + 1);
  const [readiness, setReadiness] = useState<ContentReadiness>(record?.readiness ?? 'planned');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [invalidDurations, setInvalidDurations] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState(0);
  const setTopic = (index: number, update: (topic: CourseTopicData) => CourseTopicData) => setSnapshot((current) => ({ ...current, topics: current.topics.map((topic, i) => i === index ? update(topic) : topic) }));
  function validateContent() {
    const invalidOption = snapshot.topics.flatMap((item) => item.chordLesson?.options ?? []).find((option) => [...option.midi, ...option.arpeggioMidi].some((value) => !Number.isInteger(value) || value < 0 || value > 127));
    if (invalidOption) return `A opção de acorde “${invalidOption.label || invalidOption.id}” contém MIDI inválido (use inteiros de 0 a 127).`;
    if (invalidDurations.length) return 'Corrija as durações de vídeo para o formato mm:ss antes de salvar.';
    if (snapshot.quiz.some((question) => question.answer < 0 || question.answer >= question.options.length || !Number.isInteger(question.answer))) return 'Cada pergunta precisa apontar para uma alternativa válida.';
    return '';
  }
  async function saveDraft() {
    const invalid = validateContent(); if (invalid) { setError(invalid); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      let updated = record;
      if (record) updated = await api.updateModule(record.id, { levelId, number: Number(number), sortOrder: Number(sortOrder), readiness });
      else updated = await api.createModule(levelId, readiness);
      const normalizedSnapshot = { ...snapshot, topics: snapshot.topics.map((item) => ({ ...item, videos: item.videos.map((video, index) => ({ ...video, moduleId: updated!.id, topicId: item.id, topic: item.title, sortOrder: index + 1 })) })) };
      const saved = await api.saveDraft(updated.id, normalizedSnapshot);
      if (!record && (number !== saved.number || sortOrder !== saved.sortOrder || levelId !== saved.levelId || readiness !== saved.readiness)) await api.updateModule(saved.id, { levelId, number: Number(number), sortOrder: Number(sortOrder), readiness });
      setNotice('Rascunho salvo. A versão publicada permanece inalterada até a publicação.'); await onSaved(saved, 'Rascunho salvo com sucesso.');
    } catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  }
  async function publish() {
    const invalid = validateContent(); if (invalid) { setError(invalid); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      let updated = record;
      if (!updated) updated = await api.createModule(levelId, readiness);
      const meta = await api.updateModule(updated.id, { levelId, number: Number(number), sortOrder: Number(sortOrder), readiness });
      const normalizedSnapshot = { ...snapshot, topics: snapshot.topics.map((item) => ({ ...item, videos: item.videos.map((video, index) => ({ ...video, moduleId: meta.id, topicId: item.id, topic: item.title, sortOrder: index + 1 })) })) };
      await api.saveDraft(meta.id, normalizedSnapshot);
      const published = await api.publishModule(meta.id);
      setNotice('Nova versão publicada.'); await onSaved(published, 'Módulo publicado.');
    } catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  }
  async function unpublish() {
    if (!record || !window.confirm('Retirar este módulo do site público? O conteúdo continuará salvo como rascunho.')) return;
    setSaving(true); setError(''); try { const result = await api.unpublishModule(record.id); await onSaved(result, 'Módulo retirado do site público.'); } catch (e) { setError(errorText(e)); } finally { setSaving(false); }
  }
  async function deleteCurrent() {
    if (!record || !window.confirm(`Excluir “${snapshot.title || `Módulo ${number}`}”? Esta ação não pode ser desfeita.`)) return;
    setSaving(true); try { await api.deleteModule(record.id); await onDeleted(); } catch (e) { setError(errorText(e)); } finally { setSaving(false); }
  }
  function addTopic() { const topic: CourseTopicData = { id: makeId('topic'), title: 'Novo tópico', highlight: [], videos: [] }; setSnapshot((current) => ({ ...current, topics: [...current.topics, topic] })); setActiveTopic(snapshot.topics.length); }
  function reorderTopic(index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= snapshot.topics.length) return; setSnapshot((current) => { const topics = [...current.topics]; [topics[index], topics[target]] = [topics[target], topics[index]]; return { ...current, topics }; }); setActiveTopic(target); }
  const topic = snapshot.topics[activeTopic];
  return <section className="admin-panel admin-editor"><div className="admin-panel-heading"><div><span className="admin-eyebrow">{record ? `MÓDULO ${record.number}` : 'NOVO CONTEÚDO'}</span><h2>{record ? 'Editar módulo' : 'Criar módulo'}</h2><p>Altere o rascunho. O conteúdo público só muda após publicar.</p></div><button className="button button-soft" onClick={onCancel} type="button"><ArrowLeft size={15} /> Voltar</button></div>{error && <Message kind="error">{error}</Message>}{notice && <Message kind="success">{notice}</Message>}
    <div className="admin-form-grid"><Field label="Título do módulo"><input value={snapshot.title} onChange={(e) => setSnapshot({ ...snapshot, title: e.target.value })} required /></Field><Field label="Nível"><select value={levelId} onChange={(e) => setLevelId(e.target.value)}>{courseLevels.map((level) => <option key={level.id} value={level.id}>Nível {level.number} · {level.title}</option>)}</select></Field><Field label="Número"><input type="number" min="1" value={number} onChange={(e) => setNumber(Number(e.target.value))} /></Field><Field label="Ordem"><input type="number" min="1" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></Field><Field label="Prontidão"><select value={readiness} onChange={(e) => setReadiness(e.target.value as ContentReadiness)}><option value="planned">Planejado</option><option value="ready">Pronto</option></select></Field><Field label="Introdução / descrição"><textarea rows={4} value={snapshot.description} onChange={(e) => setSnapshot({ ...snapshot, description: e.target.value })} /></Field></div>
    <section className="admin-subsection"><div className="admin-section-title"><div><h3>Tópicos</h3><p>Conteúdo de aula, atividade, vídeo e destaques do teclado.</p></div><button className="button button-soft" type="button" onClick={addTopic}><Plus size={15} /> Adicionar tópico</button></div>
    {snapshot.topics.length > 0 && <div className="admin-topic-tabs" role="tablist" aria-label="Tópicos do módulo">{snapshot.topics.map((item, index) => <div className={index === activeTopic ? 'is-active' : ''} key={item.id}><button role="tab" aria-selected={index === activeTopic} type="button" onClick={() => setActiveTopic(index)}>{index + 1}. {item.title || 'Sem título'}</button><button type="button" aria-label={`Mover tópico ${item.title} para cima`} disabled={index === 0} onClick={() => reorderTopic(index, -1)}><ArrowUp size={13} /></button><button type="button" aria-label={`Mover tópico ${item.title} para baixo`} disabled={index === snapshot.topics.length - 1} onClick={() => reorderTopic(index, 1)}><ArrowDown size={13} /></button></div>)}</div>}
    {topic ? <div className="admin-topic-editor"><div className="admin-section-title"><h3>Editar tópico</h3><button className="admin-icon-danger" type="button" aria-label="Remover tópico" onClick={() => { if (window.confirm(`Remover o tópico “${topic.title}”?`)) { setSnapshot((current) => ({ ...current, topics: current.topics.filter((_, index) => index !== activeTopic) })); setActiveTopic(Math.max(0, activeTopic - 1)); } }}><Trash2 size={16} /></button></div><div className="admin-form-grid"><Field label="Título do tópico"><input value={topic.title} onChange={(e) => setTopic(activeTopic, (item) => ({ ...item, title: e.target.value }))} /></Field><Field label="Explicação"><textarea rows={5} value={topic.lesson?.explanation ?? ''} onChange={(e) => setTopic(activeTopic, (item) => ({ ...item, lesson: { ...item.lesson, explanation: e.target.value, example: item.lesson?.example ?? '', exercises: item.lesson?.exercises ?? [], checklist: item.lesson?.checklist ?? [] } }))} /></Field><Field label="Exemplo"><textarea rows={3} value={topic.lesson?.example ?? ''} onChange={(e) => setTopic(activeTopic, (item) => ({ ...item, lesson: { ...item.lesson, example: e.target.value, explanation: item.lesson?.explanation ?? '', exercises: item.lesson?.exercises ?? [], checklist: item.lesson?.checklist ?? [] } }))} /></Field><TextList label="Exercícios · uma linha por item" values={topic.lesson?.exercises ?? []} onChange={(values) => setTopic(activeTopic, (item) => ({ ...item, lesson: { ...item.lesson, exercises: values, explanation: item.lesson?.explanation ?? '', example: item.lesson?.example ?? '', checklist: item.lesson?.checklist ?? [] } }))} /><TextList label="Checklist da aula · uma linha por item" values={topic.lesson?.checklist ?? []} onChange={(values) => setTopic(activeTopic, (item) => ({ ...item, lesson: { ...item.lesson, checklist: values, explanation: item.lesson?.explanation ?? '', example: item.lesson?.example ?? '', exercises: item.lesson?.exercises ?? [] } }))} /><TextList label="Destaques no teclado · notas" values={topic.lesson?.highlight ?? topic.highlight} onChange={(values) => setTopic(activeTopic, (item) => ({ ...item, lesson: { ...item.lesson, highlight: values, explanation: item.lesson?.explanation ?? '', example: item.lesson?.example ?? '', exercises: item.lesson?.exercises ?? [], checklist: item.lesson?.checklist ?? [] }, highlight: values }))} /></div>
    <VideoEditor topic={topic} modules={modules} moduleId={record?.id ?? ''} onChange={(videos) => setTopic(activeTopic, (item) => ({ ...item, videos }))} onError={setError} onDurationValidity={(videoId, valid) => setInvalidDurations((current) => valid ? current.filter((id) => id !== videoId) : current.includes(videoId) ? current : [...current, videoId])} onMove={async (videoId, targetModuleId, targetTopicId) => { if (invalidDurations.length) throw new Error('Corrija as durações de vídeo para o formato mm:ss antes de mover.'); if (!record) throw new Error('Salve o módulo antes de mover vídeos.'); const meta = await api.updateModule(record.id, { levelId, number: Number(number), sortOrder: Number(sortOrder), readiness }); const normalized = { ...snapshot, topics: snapshot.topics.map((item) => ({ ...item, videos: item.videos.map((video, index) => ({ ...video, moduleId: record.id, topicId: item.id, topic: item.title, sortOrder: index + 1 })) })) }; await api.saveDraft(meta.id, normalized); await api.moveVideo(videoId, record.id, targetModuleId, targetTopicId); window.location.reload(); }} />
    <QuizAndChordEditor snapshot={snapshot} setSnapshot={setSnapshot} topic={topic} setTopic={(update) => setTopic(activeTopic, update)} />
    </div> : <p className="admin-empty">Adicione um tópico para editar aulas, atividades e vídeos.</p>}</section>
    <QuizEditor questions={snapshot.quiz} onChange={(quiz) => setSnapshot((current) => ({ ...current, quiz }))} />
    <footer className="admin-editor-footer"><span>{record?.isPublished ? 'Publicado' : 'Rascunho'}{record?.hasPendingChanges ? ' · alterações pendentes' : ''}</span><div><button className="button button-soft" type="button" disabled={saving} onClick={() => void saveDraft()}><Save size={15} /> {saving ? 'Salvando…' : 'Salvar rascunho'}</button>{record?.isPublished && <button className="button button-soft" type="button" disabled={saving} onClick={() => void unpublish()}>Retirar do site</button>}<button className="button button-primary" type="button" disabled={saving} onClick={() => void publish()}>{saving ? 'Publicando…' : record?.isPublished ? 'Salvar e publicar' : 'Publicar'}</button>{record && <button className="admin-icon-danger" type="button" aria-label="Excluir módulo" onClick={() => void deleteCurrent()}><Trash2 size={16} /></button>}</div></footer>
  </section>;
}

function VideoEditor({ topic, modules, moduleId, onChange, onError, onMove, onDurationValidity }: { topic: CourseTopicData; modules: AdminModuleRecord[]; moduleId: string; onChange: (videos: VideoItem[]) => void; onError: (error: string) => void; onDurationValidity: (videoId: string, valid: boolean) => void; onMove: (videoId: string, targetModuleId: string, targetTopicId: string) => Promise<void> }) {
  const [moving, setMoving] = useState<string | null>(null);
  const [targetModule, setTargetModule] = useState('');
  const [targetTopic, setTargetTopic] = useState('');
  const [durationDrafts, setDurationDrafts] = useState<Record<string, string>>({});
  function newVideo(): VideoItem {
    return { id: makeId('video'), topicId: topic.id, moduleId, topic: topic.title, title: '', channel: '', url: '', description: '', badge: 'Mais recomendado', note: '', didacticEvidence: '', commentsEvidence: '', audioVideoEvidence: '', viewsNote: '', evidenceUrls: [], sortOrder: topic.videos.length + 1 };
  }
  const update = (index: number, patch: Partial<VideoItem>) => onChange(topic.videos.map((video, i) => i === index ? { ...video, ...patch } : video));
  return <section className="admin-subsection">
    <div className="admin-section-title"><div><h3><Video size={17} /> Vídeos</h3><p>Os vídeos são exibidos sem reprodução automática.</p></div><button className="button button-soft" type="button" onClick={() => onChange([...topic.videos, newVideo()])}><Plus size={15} /> Adicionar vídeo</button></div>
    {topic.videos.map((video, index) => {
      const youtubeId = parseYoutubeId(video.url);
      const destination = modules.find((module) => module.id === targetModule);
      return <article className="admin-nested-card" key={video.id}>
        <div className="admin-section-title"><strong>Vídeo {index + 1}</strong><div>
          <button type="button" className="admin-icon-button" disabled={index === 0} aria-label="Mover vídeo para cima" onClick={() => { const next = [...topic.videos]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next.map((item, sortOrder) => ({ ...item, sortOrder: sortOrder + 1 }))); }}><ArrowUp size={14} /></button>
          <button type="button" className="admin-icon-button" disabled={index === topic.videos.length - 1} aria-label="Mover vídeo para baixo" onClick={() => { const next = [...topic.videos]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next.map((item, sortOrder) => ({ ...item, sortOrder: sortOrder + 1 }))); }}><ArrowDown size={14} /></button>
          <button type="button" className="admin-icon-danger" aria-label="Remover vídeo" onClick={() => { if (window.confirm(`Remover o vídeo “${video.title || 'sem título'}”?`)) { onDurationValidity(video.id, true); onChange(topic.videos.filter((_, i) => i !== index)); } }}><Trash2 size={15} /></button>
        </div></div>
        <div className="admin-form-grid">
          <Field label="Título"><input required value={video.title} onChange={(e) => update(index, { title: e.target.value })} /></Field>
          <Field label="Canal"><input required value={video.channel} onChange={(e) => update(index, { channel: e.target.value })} /></Field>
          <Field label="URL do YouTube" hint="Hosts aceitos: youtube.com, www.youtube.com, m.youtube.com e youtu.be."><input required type="url" value={video.url} onChange={(e) => update(index, { url: e.target.value })} /></Field>
          <Field label="Duração (mm:ss)" hint="Opcional. Ex.: 4:25"><input inputMode="numeric" placeholder="4:25" value={durationDrafts[video.id] ?? (video.durationSeconds == null ? '' : `${Math.floor(video.durationSeconds / 60)}:${String(video.durationSeconds % 60).padStart(2, '0')}`)} onChange={(e) => { const value = e.target.value.trim(); setDurationDrafts((current) => ({ ...current, [video.id]: value })); const match = value.match(/^(\d{1,3}):(\d{1,2})$/); const valid = !value || (!!match && Number(match[2]) < 60); onDurationValidity(video.id, valid); if (!value) update(index, { durationSeconds: undefined }); else if (match && valid) update(index, { durationSeconds: Number(match[1]) * 60 + Number(match[2]) }); }} /></Field>
          <Field label="Descrição / observação pedagógica"><textarea rows={3} value={video.description} onChange={(e) => update(index, { description: e.target.value })} /></Field>
          <Field label="Selo"><select value={video.badge} onChange={(e) => update(index, { badge: e.target.value as VideoItem['badge'] })}><option>Mais recomendado</option><option>Melhor didática</option></select></Field>
          <Field label="Nota de curadoria"><textarea rows={2} value={video.note} onChange={(e) => update(index, { note: e.target.value })} /></Field>
          <Field label="Evidência didática"><textarea rows={2} value={video.didacticEvidence} onChange={(e) => update(index, { didacticEvidence: e.target.value })} /></Field>
          <Field label="Avaliações e comentários"><textarea rows={2} value={video.commentsEvidence} onChange={(e) => update(index, { commentsEvidence: e.target.value })} /></Field>
          <Field label="Áudio e imagem"><textarea rows={2} value={video.audioVideoEvidence} onChange={(e) => update(index, { audioVideoEvidence: e.target.value })} /></Field>
          <Field label="Nota de visualizações"><input value={video.viewsNote} onChange={(e) => update(index, { viewsNote: e.target.value })} /></Field>
          <TextList label="URLs de evidência · uma por linha" values={video.evidenceUrls} onChange={(values) => update(index, { evidenceUrls: values })} />
        </div>
        {durationDrafts[video.id] && !/^(\d{1,3}):([0-5]\d)$/.test(durationDrafts[video.id]) && <Message kind="error">Use a duração no formato mm:ss (segundos entre 00 e 59).</Message>}
        {video.url && (youtubeId ? <div className="admin-video-preview"><span>Prévia disponível · clique para carregar</span><div className="admin-video-frame"><YoutubeClickToLoad id={youtubeId} title={video.title || 'Prévia do vídeo'} channel={video.channel || undefined} /></div></div> : <Message kind="error">Link inválido. Informe um link de vídeo válido do YouTube.</Message>)}
        <details className="admin-move-video"><summary>Mover vídeo para outro módulo ou tópico</summary><div className="admin-inline-form">
          <Field label="Módulo de destino"><select value={targetModule} onChange={(e) => { setTargetModule(e.target.value); setTargetTopic(''); }}><option value="">Selecione…</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.draftContent.title || `Módulo ${module.number}`}</option>)}</select></Field>
          <Field label="Tópico de destino"><select value={targetTopic} onChange={(e) => setTargetTopic(e.target.value)}><option value="">Selecione…</option>{destination?.draftContent.topics.map((target) => <option key={target.id} value={target.id}>{target.title}</option>)}</select></Field>
          <button className="button button-soft" type="button" disabled={!targetModule || !targetTopic || moving === video.id} onClick={async () => { setMoving(video.id); onError(''); try { await onMove(video.id, targetModule, targetTopic); } catch (e) { onError(errorText(e)); } finally { setMoving(null); } }}>{moving === video.id ? 'Movendo…' : 'Mover vídeo'}</button>
        </div><small>Salve o rascunho antes de mover. A operação transacional altera os rascunhos no servidor.</small></details>
      </article>;
    })}
  </section>;
}
function QuizEditor({ questions, onChange }: { questions: QuizQuestion[]; onChange: (questions: QuizQuestion[]) => void }) {
  const patch = (index: number, fields: Partial<QuizQuestion>) => onChange(questions.map((item, i) => i === index ? { ...item, ...fields } : item));
  return <section className="admin-subsection"><div className="admin-section-title"><div><h3>Questionário do módulo</h3><p>Inclua perguntas, alternativas, resposta correta e explicação.</p></div><button className="button button-soft" type="button" onClick={() => onChange([...questions, { prompt: '', options: ['', ''], answer: 0, explanation: '' }])}><Plus size={15} /> Adicionar pergunta</button></div>{questions.map((question, index) => <article className="admin-nested-card" key={`quiz-${index}`}><div className="admin-section-title"><strong>Pergunta {index + 1}</strong><div>{index > 0 && <button type="button" className="admin-icon-button" aria-label="Mover pergunta para cima" onClick={() => { const next = [...questions]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}><ArrowUp size={14} /></button>}{index < questions.length - 1 && <button type="button" className="admin-icon-button" aria-label="Mover pergunta para baixo" onClick={() => { const next = [...questions]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next); }}><ArrowDown size={14} /></button>}<button type="button" className="admin-icon-danger" aria-label="Remover pergunta" onClick={() => onChange(questions.filter((_, i) => i !== index))}><Trash2 size={15} /></button></div></div><Field label="Enunciado"><textarea value={question.prompt} rows={2} onChange={(e) => patch(index, { prompt: e.target.value })} /></Field><TextList label="Alternativas · uma por linha" values={question.options} onChange={(options) => patch(index, { options, answer: Math.min(question.answer, Math.max(0, options.length - 1)) })} /><Field label="Índice da resposta correta (começa em zero)"><input type="number" min="0" max={Math.max(0, question.options.length - 1)} value={question.answer} onChange={(e) => patch(index, { answer: Number(e.target.value) })} /></Field><Field label="Explicação da resposta"><textarea rows={2} value={question.explanation} onChange={(e) => patch(index, { explanation: e.target.value })} /></Field></article>)}</section>;
}

function QuizAndChordEditor({ snapshot, setSnapshot, topic, setTopic }: { snapshot: ModuleSnapshot; setSnapshot: (snapshot: ModuleSnapshot) => void; topic: CourseTopicData; setTopic: (updater: (topic: CourseTopicData) => CourseTopicData) => void }) {
  void snapshot; void setSnapshot;
  const config = topic.chordLesson;
  function setConfig(next: ChordLessonConfig | undefined) { setTopic((item) => { const result = { ...item }; if (next) result.chordLesson = next; else delete result.chordLesson; return result; }); }
  const options = config?.options ?? [];
  function patchOption(index: number, patch: Partial<ChordOption>) { setConfig({ prompt: config?.prompt ?? '', playSequenceLabel: config?.playSequenceLabel, options: options.map((option, i) => i === index ? { ...option, ...patch } : option) }); }
  const parseNumbers = (value: string) => value.split(',').map((part) => part.trim()).filter(Boolean).map((part) => Number(part));
  return <section className="admin-subsection"><div className="admin-section-title"><div><h3>Atividade de acorde / teclado</h3><p>Prompt, sequência e opções com notas e valores MIDI.</p></div>{!config ? <button className="button button-soft" type="button" onClick={() => setConfig({ prompt: '', options: [] })}><Plus size={15} /> Criar atividade</button> : <button className="button button-soft" type="button" onClick={() => { if (window.confirm('Remover esta atividade de acorde?')) setConfig(undefined); }}><Trash2 size={14} /> Remover atividade</button>}</div>{config && <><Field label="Instrução da atividade"><textarea rows={3} value={config.prompt} onChange={(e) => setConfig({ ...config, prompt: e.target.value })} /></Field><Field label="Rótulo da sequência de notas"><input value={config.playSequenceLabel ?? ''} onChange={(e) => setConfig({ ...config, playSequenceLabel: e.target.value })} /></Field>{options.map((option, index) => <article className="admin-nested-card" key={option.id}><div className="admin-section-title"><strong>Opção {index + 1}</strong><button type="button" className="admin-icon-danger" aria-label="Remover opção" onClick={() => setConfig({ ...config, options: options.filter((_, i) => i !== index) })}><Trash2 size={15} /></button></div><div className="admin-form-grid"><Field label="ID"><input value={option.id} onChange={(e) => patchOption(index, { id: e.target.value })} /></Field><Field label="Rótulo"><input value={option.label} onChange={(e) => patchOption(index, { label: e.target.value })} /></Field><Field label="Grupo"><input value={option.group ?? ''} onChange={(e) => patchOption(index, { group: e.target.value })} /></Field><Field label="Notas · separadas por vírgula"><input value={option.notes.join(', ')} onChange={(e) => patchOption(index, { notes: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></Field><Field label="MIDI · inteiros separados por vírgula"><input inputMode="numeric" value={option.midi.join(', ')} onChange={(e) => patchOption(index, { midi: parseNumbers(e.target.value) })} /></Field><Field label="MIDI do arpejo · inteiros separados por vírgula"><input inputMode="numeric" value={option.arpeggioMidi.join(', ')} onChange={(e) => patchOption(index, { arpeggioMidi: parseNumbers(e.target.value) })} /></Field></div>{[...option.midi, ...option.arpeggioMidi].some((number) => !Number.isInteger(number) || number < 0 || number > 127) && <Message kind="error">Valores MIDI devem ser inteiros de 0 a 127.</Message>}</article>)}<button className="button button-soft" type="button" onClick={() => setConfig({ ...config, options: [...options, { id: makeId('chord'), label: '', group: '', notes: [], midi: [], arpeggioMidi: [] }] })}><Plus size={15} /> Adicionar opção</button></>}</section>;
}

function GlossaryEditor({ entries, onRefresh, onError, onNotice }: { entries: AdminGlossaryRecord[]; onRefresh: () => Promise<void>; onError: (value: string) => void; onNotice: (value: string) => void }) {
  const [editing, setEditing] = useState<AdminGlossaryRecord | null>(null);
  const [draft, setDraft] = useState<GlossaryDraftContent>({ term: '', definition: '', group: '' });
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  function begin(entry?: AdminGlossaryRecord) {
    setFormOpen(true);
    setEditing(entry ?? null);
    setDraft(entry ? { ...entry.draftContent } : { term: '', definition: '', group: '' });
  }
  function closeForm() {
    setEditing(null);
    setDraft({ term: '', definition: '', group: '' });
    setFormOpen(false);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    const wasEditing = Boolean(editing);
    setBusy(true);
    onError('');
    try {
      if (editing) await api.updateGlossary(editing.id, draft);
      else await api.createGlossary(draft);
      await onRefresh();
      onNotice(wasEditing ? 'Rascunho atualizado. Publique para refletir no site.' : 'Termo salvo como rascunho. Publique para exibi-lo no site.');
      closeForm();
    } catch (error) { onError(errorText(error)); }
    finally { setBusy(false); }
  }
  async function publish(entry: AdminGlossaryRecord) {
    setBusy(true);
    onError('');
    try {
      await api.publishGlossary(entry.id);
      await onRefresh();
      onNotice(`“${entry.draftContent.term}” publicado no glossário.`);
    } catch (error) { onError(errorText(error)); }
    finally { setBusy(false); }
  }
  async function unpublish(entry: AdminGlossaryRecord) {
    if (!window.confirm(`Retirar “${entry.publishedContent?.term ?? entry.draftContent.term}” do glossário público e manter como rascunho?`)) return;
    setBusy(true);
    onError('');
    try {
      await api.unpublishGlossary(entry.id);
      await onRefresh();
      onNotice('Termo retirado do site e mantido como rascunho.');
    } catch (error) { onError(errorText(error)); }
    finally { setBusy(false); }
  }
  async function remove(entry: AdminGlossaryRecord) {
    if (!window.confirm(`Excluir definitivamente o termo “${entry.draftContent.term}”?`)) return;
    setBusy(true);
    onError('');
    try {
      await api.deleteGlossary(entry.id);
      await onRefresh();
      onNotice('Termo excluído.');
    } catch (error) { onError(errorText(error)); }
    finally { setBusy(false); }
  }

  return <section className="admin-panel">
    <div className="admin-panel-heading"><div><span className="admin-eyebrow">REFERÊNCIA DO CURSO</span><h2>Glossário</h2><p>Edite os termos como rascunho e publique quando estiverem prontos.</p></div><button className="button button-primary" type="button" onClick={() => begin()}><Plus size={15} /> Novo termo</button></div>
    {formOpen && <form className="admin-glossary-form" onSubmit={save}>
      <h3>{editing ? 'Editar rascunho do termo' : 'Novo termo'}</h3>
      {editing?.isPublished && editing.hasPendingChanges && <Message>O site continua mostrando a versão publicada até você publicar estas alterações.</Message>}
      <div className="admin-form-grid"><Field label="Termo"><input required maxLength={255} value={draft.term} onChange={(event) => setDraft({ ...draft, term: event.target.value })} /></Field><Field label="Grupo"><input required maxLength={128} value={draft.group} onChange={(event) => setDraft({ ...draft, group: event.target.value })} /></Field><Field label="Definição"><textarea required rows={4} maxLength={100000} value={draft.definition} onChange={(event) => setDraft({ ...draft, definition: event.target.value })} /></Field></div>
      <div className="admin-actions"><button className="button button-soft" type="button" disabled={busy} onClick={closeForm}>Cancelar</button><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar rascunho'}</button></div>
    </form>}
    <div className="admin-glossary-list">{entries.map((entry) => <article className="admin-glossary-row" key={entry.id}>
      <div><span>{entry.draftContent.group || 'Sem grupo'}</span><strong>{entry.draftContent.term}</strong><div className="admin-badges"><span className={`admin-badge ${entry.isPublished ? 'published' : 'draft'}`}>{entry.isPublished ? 'Publicado' : 'Rascunho'}</span>{entry.isPublished && entry.hasPendingChanges && <span className="admin-badge pending">Alterações pendentes</span>}</div><p>{entry.draftContent.definition}</p>{entry.isPublished && entry.hasPendingChanges && entry.publishedContent && <small>Versão no site: {entry.publishedContent.term}</small>}</div>
      <div><button type="button" className="button button-soft" disabled={busy} onClick={() => begin(entry)}>Editar</button>{entry.hasPendingChanges && <button type="button" className="button button-soft" disabled={busy} onClick={() => void publish(entry)}>Publicar</button>}{entry.isPublished && <button type="button" className="button button-soft" disabled={busy} onClick={() => void unpublish(entry)}>Despublicar</button>}<button type="button" className="admin-icon-danger" disabled={busy} aria-label={`Excluir termo ${entry.draftContent.term}`} onClick={() => void remove(entry)}><Trash2 size={15} /></button></div>
    </article>)}{entries.length === 0 && <p className="admin-empty">O glossário está vazio.</p>}</div>
  </section>;
}
