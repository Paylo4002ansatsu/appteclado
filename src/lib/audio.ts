let audioContext: AudioContext | null = null;
let chordPlaybackNodes: OscillatorNode[] = [];

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Context = window.AudioContext;
  if (!Context) return null;
  audioContext ??= new Context();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function stopChordPlayback(context: AudioContext) {
  const nodes = chordPlaybackNodes;
  chordPlaybackNodes = [];
  for (const node of nodes) {
    try {
      node.stop(context.currentTime);
    } catch {
      // O nó pode já ter terminado naturalmente.
    }
  }
}

function scheduleTone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume: number,
  group?: OscillatorNode[],
) {
  const oscillator = context.createOscillator();
  const overtone = context.createOscillator();
  const gain = context.createGain();
  const overtoneGain = context.createGain();

  oscillator.type = 'triangle';
  overtone.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startAt);
  overtone.frequency.setValueAtTime(frequency * 2, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  overtoneGain.gain.setValueAtTime(volume * 0.18, startAt);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration * 0.72);
  oscillator.connect(gain).connect(context.destination);
  overtone.connect(overtoneGain).connect(context.destination);
  oscillator.start(startAt);
  overtone.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
  overtone.stop(startAt + duration + 0.02);

  if (group) group.push(oscillator, overtone);
}

export function playTone(frequency: number, duration = 0.7, volume = 0.12) {
  const context = getAudioContext();
  if (!context) return false;
  scheduleTone(context, frequency, context.currentTime, duration, volume);
  return true;
}

export function playChord(frequencies: number[], duration = 1.35, volume = 0.075) {
  const context = getAudioContext();
  if (!context || frequencies.length === 0) return false;

  stopChordPlayback(context);
  const group: OscillatorNode[] = [];
  chordPlaybackNodes = group;
  const startAt = context.currentTime + 0.018;
  frequencies.forEach((frequency) => scheduleTone(context, frequency, startAt, duration, volume, group));
  window.setTimeout(() => {
    if (chordPlaybackNodes === group) chordPlaybackNodes = [];
  }, (duration + 0.15) * 1000);
  return true;
}

export function playArpeggio(
  frequencies: number[],
  noteDuration = 0.46,
  spacing = 0.17,
  volume = 0.11,
) {
  const context = getAudioContext();
  if (!context || frequencies.length === 0) return false;

  stopChordPlayback(context);
  const group: OscillatorNode[] = [];
  chordPlaybackNodes = group;
  const startAt = context.currentTime + 0.018;
  frequencies.forEach((frequency, index) => {
    scheduleTone(context, frequency, startAt + index * spacing, noteDuration, volume, group);
  });
  window.setTimeout(() => {
    if (chordPlaybackNodes === group) chordPlaybackNodes = [];
  }, (frequencies.length * spacing + noteDuration + 0.15) * 1000);
  return true;
}

export function playClick(accent = false) {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(accent ? 1280 : 900, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.2 : 0.12, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.09);
}
