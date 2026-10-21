import { useEffect, useState } from 'react';
import { Minus, Pause, Play, Plus } from 'lucide-react';
import { playClick } from '../lib/audio';

export function Metronome() {
  const [bpm, setBpm] = useState(72);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [beat, setBeat] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setBeat((current) => {
        const next = (current + 1) % beatsPerBar;
        playClick(next === 0);
        return next;
      });
    }, 60000 / bpm);
    return () => window.clearInterval(timer);
  }, [running, bpm, beatsPerBar]);

  const toggle = () => {
    if (!running) {
      playClick(true);
      setBeat(0);
    }
    setRunning((value) => !value);
  };

  return (
    <section className="metronome-card" aria-label="Metrônomo">
      <div className="metronome-topline"><span className="eyebrow">FERRAMENTA DE PRÁTICA</span><span className={`live-dot${running ? ' live' : ''}`} /></div>
      <h2>Metrônomo</h2>
      <p>Encontre uma pulsação confortável. O primeiro tempo recebe um acento.</p>
      <div className="tempo-control">
        <button type="button" className="round-control" onClick={() => setBpm((value) => Math.max(30, value - 1))} aria-label="Diminuir BPM"><Minus size={17} /></button>
        <div className="tempo-value"><strong>{bpm}</strong><span>BPM</span></div>
        <button type="button" className="round-control" onClick={() => setBpm((value) => Math.min(240, value + 1))} aria-label="Aumentar BPM"><Plus size={17} /></button>
      </div>
      <input aria-label="Andamento em batidas por minuto" className="tempo-range" type="range" min="30" max="180" value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
      <div className="meter-row"><label htmlFor="meter-select">Compassos</label><select id="meter-select" value={beatsPerBar} onChange={(event) => { setBeatsPerBar(Number(event.target.value)); setBeat(0); }}><option value={2}>2/4</option><option value={3}>3/4</option><option value={4}>4/4</option></select></div>
      <div className="beat-dots" aria-label={`Tempo ${beat + 1} de ${beatsPerBar}`}>
        {Array.from({ length: beatsPerBar }, (_, index) => <span key={index} className={`beat-dot${beat === index ? ' active' : ''}${index === 0 ? ' accent' : ''}`} />)}
      </div>
      <button type="button" className="button button-primary metro-button" onClick={toggle}>{running ? <Pause size={17} /> : <Play size={17} fill="currentColor" />} {running ? 'Pausar' : 'Começar'}</button>
      <span className="muted-note">O som começa após tocar em “Começar”.</span>
    </section>
  );
}
