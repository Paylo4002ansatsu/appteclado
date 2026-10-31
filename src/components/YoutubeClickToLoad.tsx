import { useState } from 'react';
import { Play } from 'lucide-react';
import '../styles/youtubePrivacy.css';

const PRIVACY_NOTICE = 'Ao reproduzir, o vídeo é carregado do YouTube, que pode coletar dados de acesso.';

type YoutubeClickToLoadProps = {
  id: string;
  title: string;
  channel?: string;
};

export function YoutubeClickToLoad({ id, title, channel }: YoutubeClickToLoadProps) {
  const [playing, setPlaying] = useState(false);
  const safeTitle = title.trim() || 'Vídeo do YouTube';
  const safeChannel = channel?.trim() || 'Canal não informado';

  if (playing) {
    return (
      <div className="youtube-privacy-player">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=0`}
          title={`${safeTitle} — ${safeChannel}`}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="youtube-privacy-player">
      <button
        className="youtube-privacy-play"
        type="button"
        aria-label={`Reproduzir vídeo: ${safeTitle} — ${safeChannel}`}
        onClick={() => setPlaying(true)}
      >
        <span className="youtube-privacy-play-icon" aria-hidden="true"><Play size={22} fill="currentColor" /></span>
        <span className="youtube-privacy-title">{safeTitle}</span>
        <span className="youtube-privacy-channel">Canal: {safeChannel}</span>
        <span className="youtube-privacy-play-label">Play</span>
      </button>
      <p className="youtube-privacy-notice">{PRIVACY_NOTICE}</p>
    </div>
  );
}
