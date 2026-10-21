import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BrowserRouter, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AudioLines, BookOpen, ChevronRight, Compass, Home, Menu, Moon, Music2, Search, Sun, X } from 'lucide-react';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { allTopics } from './data/curriculum';
import { ProgressBar } from './components/ProgressBar';
import { HomePage } from './pages/HomePage';
import { TrailPage } from './pages/TrailPage';
import { LevelPage, LessonPage, ModulePage, NotFoundPage } from './pages/CoursePages';
import { CurationPage, GlossaryPage, LevelTestPage, PracticePage } from './pages/ToolsPages';

const navItems: { to: string; label: string; icon: ReactNode; end?: boolean }[] = [
  { to: '/', label: 'Início', icon: <Home size={18} />, end: true },
  { to: '/trilha', label: 'Mapa da trilha', icon: <Compass size={18} /> },
  { to: '/nivelamento', label: 'Teste de nível', icon: <BookOpen size={18} /> },
  { to: '/glossario', label: 'Glossário', icon: <BookOpen size={18} /> },
  { to: '/pratica', label: 'Prática', icon: <AudioLines size={18} /> },
  { to: '/curadoria', label: 'Vídeos e curadoria', icon: <Music2 size={18} /> },
];

const normalizeSearch = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

function AppShell() {
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const { completed, theme, setTheme } = useProgress();
  const location = useLocation();
  const navigate = useNavigate();
  const found = useMemo(() => {
    if (search.trim().length < 2) return [];
    const term = normalizeSearch(search.trim());
    return allTopics.filter((topic) => normalizeSearch(topic.title).includes(term) || normalizeSearch(topic.module.title).includes(term)).slice(0, 8);
  }, [search]);
  const totalProgress = Math.round(completed.length / Math.max(1, allTopics.filter((topic) => topic.module.number <= 10).length) * 100);
  const pathName = location.pathname === '/' ? 'Início' : navItems.find((item) => item.to !== '/' && location.pathname.startsWith(item.to))?.label ?? 'Sua trilha';

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchInput.current) {
        setSearch('');
        searchInput.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openTopic = (topicId: string) => { navigate(`/aula/${topicId}`); setSearch(''); setMobileNav(false); };

  return (
    <div className={`app-shell${mobileNav ? ' nav-open' : ''}`}>
      {mobileNav && <button className="nav-scrim" type="button" aria-label="Fechar menu" onClick={() => setMobileNav(false)} />}
      <aside className="sidebar">
        <NavLink to="/" className="brand-lockup" onClick={() => setMobileNav(false)}>
          <span className="brand-mark"><span /><span /><span /></span>
          <span className="brand-text"><strong>trilha</strong><small>do teclado</small></span>
        </NavLink>
        <div className="sidebar-intro"><span className="eyebrow">SEU ESPAÇO DE PRÁTICA</span><p>Um passo de cada vez. O próximo está logo ali.</p></div>
        <nav className="side-navigation" aria-label="Navegação principal">
          <span className="nav-section-label">CURSO</span>
          {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setMobileNav(false)}>{item.icon}<span>{item.label}</span>{item.to === '/trilha' && <ChevronRight size={15} className="nav-chevron" />}</NavLink>)}
        </nav>
        <div className="sidebar-progress"><div className="sidebar-progress-top"><span>Seu progresso</span><strong>{totalProgress}%</strong></div><ProgressBar value={totalProgress} compact /><p>{completed.length} aulas concluídas</p><NavLink to="/trilha" className="sidebar-link">Ver percurso <ChevronRight size={14} /></NavLink></div>
        <div className="sidebar-footer"><span className="sidebar-note">Aprender também é voltar com calma.</span><span className="version-label">TRILHA DO TECLADO · 1.0</span></div>
      </aside>
      <div className="site-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" type="button" aria-label={mobileNav ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMobileNav((value) => !value)}>{mobileNav ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="breadcrumb"><span>{pathName}</span><ChevronRight size={15} /><strong>Aprenda no seu ritmo</strong></div>
          <div className="topbar-actions">
            <div className="search-wrap">
              <button type="button" className="search-trigger" aria-label="Abrir busca" onClick={() => searchInput.current?.focus()}><Search size={17} /></button><input ref={searchInput} value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && found[0]) openTopic(found[0].id); if (event.key === 'Escape') setSearch(''); }} placeholder="Buscar um tópico..." aria-label="Buscar tópico" />
              <kbd>⌘ K</kbd>
              {search && <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Limpar busca"><X size={14} /></button>}
              {search.length >= 2 && <div className="search-popover">{found.length ? found.map((topic) => <button type="button" key={topic.id} onClick={() => openTopic(topic.id)}><span><strong>{topic.title}</strong><small>Módulo {topic.module.number} · {topic.module.title}</small></span><ChevronRight size={15} /></button>) : <p>Nenhum tópico encontrado.</p>}</div>}
            </div>
            <button className="icon-button theme-button" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
            <span className="profile-initials" aria-label="Seu perfil local">TT</span>
          </div>
        </header>
        <main className="main-content"><Outlet /></main>
        <footer className="site-footer"><span>Feito para aprender no seu ritmo.</span><span>Trilha do Teclado <span className="footer-dot">·</span> Curso livre e gratuito</span></footer>
      </div>
    </div>
  );
}

function RoutedApp() {
  return <Routes><Route element={<AppShell />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/trilha" element={<TrailPage />} />
    <Route path="/nivel/:levelId" element={<LevelPage />} />
    <Route path="/modulo/:moduleId" element={<ModulePage />} />
    <Route path="/aula/:topicId" element={<LessonPage />} />
    <Route path="/nivelamento" element={<LevelTestPage />} />
    <Route path="/glossario" element={<GlossaryPage />} />
    <Route path="/pratica" element={<PracticePage />} />
    <Route path="/curadoria" element={<CurationPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}

export default function App() {
  return <ProgressProvider><BrowserRouter><RoutedApp /></BrowserRouter></ProgressProvider>;
}
