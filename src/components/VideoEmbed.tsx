import { ExternalLink, PlayCircle } from 'lucide-react';
import type { VideoItem } from '../data/videoTypes';

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

export function VideoEmbed({ video }: { video: VideoItem }) {
  const id = videoId(video.url);
  return (
    <article className="video-card">
      <div className="video-frame">
        {id ? <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`} title={`${video.title} — ${video.channel}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="video-invalid"><PlayCircle size={28} /><span>Link não reconhecido</span></div>}
      </div>
      <div className="video-info">
        <div className="video-badge-row"><span className="curation-badge">{video.badge}</span><a className="text-link" href={video.url} target="_blank" rel="noreferrer">Abrir no YouTube <ExternalLink size={13} /></a></div>
        <h3>{video.title}</h3>
        <p className="video-channel">Canal: {video.channel}</p>
        <p className="video-note">{video.note}</p>
        <details className="criteria-details"><summary>Como foi escolhido</summary><ul><li><strong>Didática:</strong> {video.didacticEvidence}</li><li><strong>Avaliações e comentários:</strong> {video.commentsEvidence}</li><li><strong>Áudio e imagem:</strong> {video.audioVideoEvidence}</li><li><strong>Visualizações:</strong> {video.viewsNote}</li></ul></details>
      </div>
    </article>
  );
}
