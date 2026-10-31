import { useState } from 'react';
import { playTone } from '../lib/audio';

const noteNames = ['Dó', 'Dó sustenido', 'Ré', 'Ré sustenido', 'Mi', 'Fá', 'Fá sustenido', 'Sol', 'Sol sustenido', 'Lá', 'Lá sustenido', 'Si'];
const frequencies = Array.from({ length: 25 }, (_, midi) => 261.6256 * Math.pow(2, midi / 12));
const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
const allKeys = Array.from({ length: 25 }, (_, index) => {
  const semitone = index % 12;
  const octave = 4 + Math.floor(index / 12);
  return { index, semitone, octave, label: `${noteNames[semitone]}${octave}`, displayName: noteNames[semitone], white: whiteNotes.includes(semitone) };
});
const flatToEnharmonic: Record<string, string> = {
  'Dó bemol': 'Si',
  'Ré bemol': 'Dó sustenido',
  'Mi bemol': 'Ré sustenido',
  'Fá bemol': 'Mi',
  'Sol bemol': 'Fá sustenido',
  'Lá bemol': 'Sol sustenido',
  'Si bemol': 'Lá sustenido',
};

function normalizeNoteLabel(value: string) {
  const match = value.match(/^(.*?)(\d+)?$/);
  if (!match) return value;
  const pitch = flatToEnharmonic[match[1]] ?? match[1];
  return `${pitch}${match[2] ?? ''}`;
}

export function PianoKeyboard({ highlight = [], interactive = true }: { highlight?: string[]; interactive?: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const whites = allKeys.filter((key) => key.white);
  const selectedNotes = new Set(highlight.map(normalizeNoteLabel));
  const play = (index: number) => {
    if (!interactive) return;
    playTone(frequencies[index], 0.65, 0.22);
    setActive(index);
    window.setTimeout(() => setActive((current) => current === index ? null : current), 170);
  };
  const isHighlighted = (key: (typeof allKeys)[number]) => (
    selectedNotes.has(normalizeNoteLabel(key.label)) || selectedNotes.has(normalizeNoteLabel(key.displayName))
  );
  const highlightedNames = highlight.join(', ');

  return (
    <div className={`keyboard-wrap${interactive ? '' : ' keyboard-wrap-readonly'}`}>
      <div
        className={`piano${interactive ? '' : ' is-readonly'}`}
        role={interactive ? 'group' : 'img'}
        aria-label={interactive
          ? 'Teclado virtual de duas oitavas. Clique ou toque em uma tecla para ouvir.'
          : `Referência visual do teclado. Notas destacadas: ${highlightedNames || 'nenhuma'}.`}
      >
        <div className="white-keys" aria-hidden={!interactive}>
          {whites.map((key, position) => (
            <button
              key={key.index}
              type="button"
              disabled={!interactive}
              tabIndex={interactive ? undefined : -1}
              className={`white-key${active === key.index ? ' is-active' : ''}${isHighlighted(key) ? ' is-highlighted' : ''}`}
              style={{ left: `${(position / whites.length) * 100}%`, width: `${100 / whites.length}%` }}
              onClick={interactive ? () => play(key.index) : undefined}
              aria-label={`Tocar ${key.label}`}
              title={`${key.label} · ${interactive ? 'tocar' : 'nota destacada'}`}
            >
              <span>{key.semitone === 0 ? key.label : ''}</span>
            </button>
          ))}
        </div>
        <div className="black-keys" aria-hidden={!interactive}>
          {allKeys.filter((key) => !key.white && key.octave <= 5).map((key) => {
            const whiteBefore = whites.filter((white) => white.index < key.index).length;
            return (
              <button
                key={key.index}
                type="button"
                disabled={!interactive}
                tabIndex={interactive ? undefined : -1}
                className={`black-key${active === key.index ? ' is-active' : ''}${isHighlighted(key) ? ' is-highlighted' : ''}`}
                style={{ left: `${(whiteBefore / whites.length) * 100}%` }}
                onClick={interactive ? () => play(key.index) : undefined}
                aria-label={`Tocar ${key.label}`}
                title={`${key.label} · ${interactive ? 'tocar' : 'nota destacada'}`}
              />
            );
          })}
        </div>
      </div>
      <p className="keyboard-caption">
        {interactive
          ? <>Toque uma tecla para ouvir. {highlight.length > 0 && <span>As notas desta aula estão realçadas.</span>}</>
          : <>Referência visual: as teclas do acorde selecionado estão realçadas.</>}
      </p>
      <p className="piano-credit">
        Amostras do <a href="https://github.com/sfzinstruments/SalamanderGrandPiano" target="_blank" rel="noreferrer">Salamander Grand Piano</a>, por Alexander Holm, transpostas para as demais teclas · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>.
      </p>
    </div>
  );
}
