import { useCallback, useEffect, useState } from 'react';
import { isVideoCatalog, type VideoItem } from '../data/videoTypes';

const OVERRIDE_KEY = 'trilha-do-teclado:video-catalog';

export function useVideoCatalog() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/data/videos.json');
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo de vídeos.');
        const source: unknown = await response.json();
        if (!isVideoCatalog(source)) throw new Error('O catálogo de vídeos tem um formato inválido ou contém tópico/link não reconhecido.');
        let selected = source;
        try {
          const override = localStorage.getItem(OVERRIDE_KEY);
          if (override) {
            const parsed: unknown = JSON.parse(override);
            if (isVideoCatalog(parsed)) selected = parsed;
          }
        } catch {
          try { localStorage.removeItem(OVERRIDE_KEY); } catch { /* armazenamento indisponível */ }
        }
        if (active) setVideos(selected);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Erro ao carregar vídeos.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const save = useCallback((next: VideoItem[]) => {
    if (!isVideoCatalog(next)) throw new Error('O catálogo deve usar IDs de tópicos válidos e links seguros do YouTube.');
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(next, null, 2));
    setVideos(next);
  }, []);

  return { videos, loading, error, save };
}
