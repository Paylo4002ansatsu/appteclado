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

export function PianoKeyboard({ highlight = [] }: { highlight?: string[] }) {
  const [active, setActive] = useState<number | null>(null);
  const whites = allKeys.filter((key) => key.white);
  const play = (index: number) => {
    playTone(frequencies[index], 0.65, 0.1);
    setActive(index);
    window.setTimeout(() => setActive((current) => current === index ? null : current), 170);
  };
  const isHighlighted = (key: (typeof allKeys)[number]) => highlight.includes(key.displayName);

  return (
    <div className="keyboard-wrap">
      <div className="piano" role="group" aria-label="Teclado virtual de duas oitavas. Clique ou toque em uma tecla para ouvir.">
        <div className="white-keys">
          {whites.map((key, position) => (
            <button
              key={key.index}
              type="button"
              className={`white-key${active === key.index ? ' is-active' : ''}${isHighlighted(key) ? ' is-highlighted' : ''}`}
              style={{ left: `${(position / whites.length) * 100}%`, width: `${100 / whites.length}%` }}
              onClick={() => play(key.index)}
              aria-label={`Tocar ${key.label}`}
              title={`${key.label} · tocar`}
            >
              <span>{key.semitone === 0 ? key.label : ''}</span>
            </button>
          ))}
        </div>
        <div className="black-keys" aria-hidden="false">
          {allKeys.filter((key) => !key.white && key.octave <= 5).map((key) => {
            const whiteBefore = whites.filter((white) => white.index < key.index).length;
            return (
              <button
                key={key.index}
                type="button"
                className={`black-key${active === key.index ? ' is-active' : ''}${isHighlighted(key) ? ' is-highlighted' : ''}`}
                style={{ left: `${(whiteBefore / whites.length) * 100}%` }}
                onClick={() => play(key.index)}
                aria-label={`Tocar ${key.label}`}
                title={`${key.label} · tocar`}
              />
            );
          })}
        </div>
      </div>
      <p className="keyboard-caption">Toque uma tecla para ouvir. {highlight.length > 0 && <span>As notas desta aula estão realçadas.</span>}</p>
    </div>
  );
}
