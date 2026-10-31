import { useState } from 'react';
import { ListMusic, Play } from 'lucide-react';
import type { ChordLessonConfig, ChordOption } from '../data/chordLessons';
import { playArpeggio, playChord } from '../lib/audio';
import { PianoKeyboard } from './PianoKeyboard';

const midiToFrequency = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export function ChordPlayer({ config, topicId }: { config: ChordLessonConfig; topicId: string }) {
  const [selectedId, setSelectedId] = useState(config.options[0]?.id ?? '');
  const [status, setStatus] = useState('');
  const selected = config.options.find((option) => option.id === selectedId) ?? config.options[0];
  const selectId = `chord-select-${topicId}`;
  const optionGroups = config.options.reduce<{ label: string; options: ChordOption[] }[]>((groups, option) => {
    const label = option.group ?? '';
    const currentGroup = groups.find((group) => group.label === label);
    if (currentGroup) currentGroup.options.push(option);
    else groups.push({ label, options: [option] });
    return groups;
  }, []);

  if (!selected) return null;

  const hearChord = () => {
    const played = playChord(selected.midi.map(midiToFrequency));
    setStatus(played
      ? `${selected.label}: acorde tocado em conjunto.`
      : 'O áudio não está disponível neste navegador.');
  };

  const hearSequence = () => {
    const played = playArpeggio(selected.arpeggioMidi.map(midiToFrequency));
    setStatus(played
      ? `${selected.label}: ${config.playSequenceLabel === 'Ouvir padrão' ? 'padrão' : 'arpejo'} tocado nota por nota.`
      : 'O áudio não está disponível neste navegador.');
  };

  return (
    <div className="chord-player">
      <p className="chord-player-prompt">{config.prompt}</p>
      <div className="chord-player-select-wrap">
        <label htmlFor={selectId}>Escolha o acorde deste exemplo</label>
        <select
          id={selectId}
          value={selected.id}
          onChange={(event) => {
            setSelectedId(event.target.value);
            setStatus('');
          }}
        >
          {optionGroups.map((group, index) => group.label
            ? <optgroup key={`${group.label}-${index}`} label={group.label}>{group.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</optgroup>
            : group.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>))}
        </select>
      </div>
      <div className="chord-player-notes" aria-label={`Notas do acorde: ${selected.notes.join(', ')}`}>
        {selected.group && <span className="chord-player-notes-label">TONALIDADE · {selected.group}</span>}
        <span className="chord-player-notes-label">NOTAS DO ACORDE</span>
        <div className="chord-note-list">
          {selected.notes.map((note, index) => <span className="chord-note-chip" key={`${note}-${index}`}>{note}</span>)}
        </div>
      </div>
      <div className="chord-player-actions">
        <button type="button" className="button button-primary" onClick={hearChord}>
          <Play size={15} aria-hidden="true" /> Ouvir acorde
        </button>
        <button type="button" className="button button-soft" onClick={hearSequence}>
          <ListMusic size={16} aria-hidden="true" /> {config.playSequenceLabel ?? 'Ouvir arpejo'}
        </button>
      </div>
      <p className="chord-player-status" aria-live="polite">
        {status || 'O som começa somente quando você escolhe um dos botões.'}
      </p>
      <PianoKeyboard highlight={selected.notes} interactive={false} />
    </div>
  );
}
