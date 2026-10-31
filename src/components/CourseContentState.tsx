import { AlertCircle, LoaderCircle } from 'lucide-react';

export function CourseContentState({ loading, error, reload }: { loading: boolean; error: string; reload: () => Promise<void> }) {
  if (loading) return <div className="empty-state" role="status"><LoaderCircle size={17} className="course-content-spinner" /> Carregando o conteúdo publicado…</div>;
  if (!error) return null;
  return <section className="empty-state course-content-error" role="alert">
    <AlertCircle size={20} />
    <div><strong>Não foi possível carregar o conteúdo do curso.</strong><p>{error}</p>
      <button type="button" className="button button-soft" onClick={() => void reload()}>Tentar novamente</button>
    </div>
  </section>;
}
