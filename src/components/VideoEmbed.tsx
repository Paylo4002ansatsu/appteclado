import { ExternalLink, PlayCircle } from 'lucide-react';
import type { VideoItem } from '../data/courseTypes';

function videoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1).split('/')[0];
    if (parsed.pathname.includes('/embed/')) return parsed.pathname.split('/embed/')[1]?.split('/')[0];
    if (parsed.pathname.includes('/shorts/')) return parsed.pathname.split('/shorts/')[1]?.split('/')[0];
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

const present = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export function VideoEmbed({ video }: { video: VideoItem }) {
  const id = videoId(video.url);
  const evidence = [
    ['Didática', video.didacticEvidence],
    ['Avaliações e comentários', video.commentsEvidence],
    ['Áudio e imagem', video.audioVideoEvidence],
    ['Visualizações', video.viewsNote],
  ].filter(([, value]) => present(value));
  return (
    <article className="video-card">
      <div className="video-frame">
        {id ? <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`} title={`${present(video.title) ? video.title : 'Vídeo'}${present(video.channel) ? ` — ${video.channel}` : ''}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="video-invalid"><PlayCircle size={28} /><span>Link não reconhecido</span></div>}
      </div>
      <div className="video-info">
        <div className="video-badge-row">{present(video.badge) && <span className="curation-badge">{video.badge}</span>}{present(video.url) && <a className="text-link" href={video.url} target="_blank" rel="noreferrer">Abrir no YouTube <ExternalLink size={13} /></a>}</div>
        {present(video.title) && <h3>{video.title}</h3>}
        {present(video.channel) && <p className="video-channel">Canal: {video.channel}</p>}
        {present(video.description) && <p className="video-note">{video.description}</p>}
        {present(video.note) && <p className="video-note">{video.note}</p>}
        {evidence.length > 0 && <details className="criteria-details"><summary>Como foi escolhido</summary><ul>{evidence.map(([label, value]) => <li key={label}><strong>{label}:</strong> {value}</li>)}</ul></details>}
      </div>
    </article>
  );
}
