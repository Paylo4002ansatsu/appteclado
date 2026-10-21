import { ArrowRight, Check, Circle, LockKeyhole, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { levels, contentReady } from '../data/curriculum';
import { useProgress } from '../context/ProgressContext';
import { ProgressBar } from '../components/ProgressBar';

export function TrailPage() {
  const { completed } = useProgress();
  return (
    <div className="page-stack trail-page">
      <div className="page-intro"><span className="eyebrow">MAPA DA TRILHA</span><h1>Seu caminho, <em>nota por nota.</em></h1><p>Os assuntos se conectam do básico à criação. Comece do início ou encontre um módulo que preencha suas lacunas.</p></div>
      <div className="trail-legend"><span><i className="legend-dot ready" /> Conteúdo disponível</span><span><i className="legend-dot upcoming" /> Estrutura pronta</span><span><i className="legend-dot done" /> Aula concluída</span></div>
      <div className="trail-levels">{levels.map((level, levelIndex) => {
        const allIds = level.modules.flatMap((module) => module.topics.map((topic) => topic.id));
        const done = allIds.filter((id) => completed.includes(id)).length;
        const percent = allIds.length ? Math.round(done / allIds.length * 100) : 0;
        return <section className={`trail-level level-${level.number}`} key={level.id} style={{ '--level-color': level.color } as React.CSSProperties}>
          <div className="trail-level-marker"><span>{level.number < 10 ? `0${level.number}` : level.number}</span>{levelIndex < levels.length - 1 && <i />}</div>
          <div className="trail-level-content">
            <div className="trail-level-heading"><div><span className="eyebrow">NÍVEL {level.number}</span><h2>{level.title}</h2><p>{level.subtitle}</p></div><div className="trail-level-progress"><strong>{percent}%</strong><small>{done} aulas concluídas</small></div></div>
            <ProgressBar value={percent} />
            <div className="trail-modules">{level.modules.map((module, moduleIndex) => {
              const ready = contentReady(module.number);
              const moduleDone = module.topics.filter((topic) => completed.includes(topic.id)).length;
              const moduleProgress = Math.round(moduleDone / Math.max(1, module.topics.length) * 100);
              return <Link to={`/modulo/${module.id}`} key={module.id} className={`trail-module${ready ? ' available' : ' planned'}`}>
                <div className="trail-module-path"><span className={`trail-module-marker${moduleDone === module.topics.length && ready ? ' done' : ''}`}>{moduleDone === module.topics.length && ready ? <Check size={13} /> : ready ? <Circle size={10} fill="currentColor" /> : <LockKeyhole size={12} />}</span>{moduleIndex < level.modules.length - 1 && <i />}</div>
                <div className="trail-module-card"><div className="trail-module-copy"><div className="trail-module-kicker">MÓDULO {String(module.number).padStart(2, '0')} <span>·</span> {ready ? 'AULA DISPONÍVEL' : 'ESTRUTURA PRONTA'}</div><h3>{module.title}</h3><p>{module.topics.slice(0, 3).map((topic) => topic.title).join(' · ')}{module.topics.length > 3 ? ' …' : ''}</p></div><div className="trail-module-side"><span>{module.topics.length} tópicos</span><ArrowRight size={17} /></div>{ready && <ProgressBar value={moduleProgress} compact />}</div>
              </Link>;
            })}</div>
            <Link to={`/nivel/${level.id}`} className="text-link trail-level-link">Ver o nível completo <ArrowRight size={14} /></Link>
          </div>
        </section>;
      })}</div>
      <div className="trail-end"><Music2 size={18} /><p>A trilha termina onde a sua música começa.</p></div>
    </div>
  );
}
