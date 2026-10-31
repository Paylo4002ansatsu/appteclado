/**
 * Sound samples: Salamander Grand Piano v3 by Alexander Holm, licensed CC BY 3.0.
 * Original source and license: https://github.com/sfzinstruments/SalamanderGrandPiano
 * Tone.js sample map reference: https://github.com/Tonejs/tonejs.github.io/blob/master/examples/sampler.html
 * Samples used by this site are stored locally in public/audio/grand-piano/.
 */

type PianoSample = { midi: number; url: string };
type ScheduledNode = AudioScheduledSourceNode;
export type PianoPlaybackResult = 'grand-piano' | 'fallback' | 'unavailable' | 'cancelled';

const pianoSamples: PianoSample[] = [
  { midi: 60, url: '/audio/grand-piano/C4.mp3' },
  { midi: 63, url: '/audio/grand-piano/Ds4.mp3' },
  { midi: 66, url: '/audio/grand-piano/Fs4.mp3' },
  { midi: 69, url: '/audio/grand-piano/A4.mp3' },
  { midi: 72, url: '/audio/grand-piano/C5.mp3' },
  { midi: 75, url: '/audio/grand-piano/Ds5.mp3' },
  { midi: 78, url: '/audio/grand-piano/Fs5.mp3' },
  { midi: 81, url: '/audio/grand-piano/A5.mp3' },
  { midi: 84, url: '/audio/grand-piano/C6.mp3' },
];

let audioContext: AudioContext | null = null;
let chordPlaybackNodes: ScheduledNode[] = [];
let chordPlaybackToken = 0;
const sampleBuffers = new Map<number, AudioBuffer>();
const sampleLoads = new Map<number, Promise<AudioBuffer>>();

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Context = window.AudioContext;
  if (!Context) return null;
  audioContext ??= new Context();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function frequencyToMidi(frequency: number) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

function nearestPianoSample(midi: number) {
  return pianoSamples.reduce((nearest, sample) => (
    Math.abs(sample.midi - midi) < Math.abs(nearest.midi - midi) ? sample : nearest
  ), pianoSamples[0]);
}

function loadPianoSample(context: AudioContext, sample: PianoSample): Promise<AudioBuffer> {
  const cached = sampleBuffers.get(sample.midi);
  if (cached) return Promise.resolve(cached);

  const pending = sampleLoads.get(sample.midi);
  if (pending) return pending;

  const request = fetch(sample.url, { cache: 'force-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Falha ao carregar a amostra ${sample.url}`);
      return response.arrayBuffer();
    })
    .then((encoded) => context.decodeAudioData(encoded))
    .then((buffer) => {
      sampleBuffers.set(sample.midi, buffer);
      return buffer;
    })
    .finally(() => sampleLoads.delete(sample.midi));

  sampleLoads.set(sample.midi, request);
  return request;
}

function stopChordPlaybackNodes(context: AudioContext) {
  chordPlaybackToken += 1;
  const nodes = chordPlaybackNodes;
  chordPlaybackNodes = [];
  for (const node of nodes) {
    try {
      node.stop(context.currentTime);
    } catch {
      // O nó pode já ter terminado naturalmente.
    }
  }
  return chordPlaybackToken;
}

export function stopChordPlayback() {
  if (audioContext) stopChordPlaybackNodes(audioContext);
}

function trackNode(node: ScheduledNode, group?: ScheduledNode[]) {
  if (!group) return;
  group.push(node);
  node.addEventListener('ended', () => {
    const index = group.indexOf(node);
    if (index >= 0) group.splice(index, 1);
    if (chordPlaybackNodes === group && group.length === 0) chordPlaybackNodes = [];
  }, { once: true });
}

function schedulePianoSample(
  context: AudioContext,
  buffer: AudioBuffer,
  sampleMidi: number,
  midi: number,
  startAt: number,
  duration: number,
  volume: number,
  group?: ScheduledNode[],
) {
  const source = context.createBufferSource();
  const gain = context.createGain();
  const peak = Math.max(0.0001, volume);
  const releaseAt = startAt + duration;
  const endAt = releaseAt + 0.75;

  source.buffer = buffer;
  source.playbackRate.setValueAtTime(Math.pow(2, (midi - sampleMidi) / 12), startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.56), releaseAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
  source.connect(gain).connect(context.destination);
  source.start(startAt);
  source.stop(endAt + 0.025);
  trackNode(source, group);
}

function scheduleSyntheticFallback(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume: number,
  group?: ScheduledNode[],
) {
  const oscillator = context.createOscillator();
  const overtone = context.createOscillator();
  const gain = context.createGain();
  const overtoneGain = context.createGain();
  const safeVolume = Math.min(volume, 0.12);

  oscillator.type = 'triangle';
  overtone.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startAt);
  overtone.frequency.setValueAtTime(frequency * 2, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(safeVolume, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  overtoneGain.gain.setValueAtTime(safeVolume * 0.18, startAt);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration * 0.72);
  oscillator.connect(gain).connect(context.destination);
  overtone.connect(overtoneGain).connect(context.destination);
  oscillator.start(startAt);
  overtone.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
  overtone.stop(startAt + duration + 0.02);
  trackNode(oscillator, group);
  trackNode(overtone, group);
}

function playSampledNotes(
  frequencies: number[],
  startOffset: (index: number) => number,
  duration: number,
  volume: number,
  cancelPrevious: boolean,
): Promise<PianoPlaybackResult> {
  const context = getAudioContext();
  if (!context || frequencies.length === 0) return Promise.resolve('unavailable');

  const notes = frequencies.map((frequency) => ({ frequency, midi: frequencyToMidi(frequency) }));
  const token = cancelPrevious ? stopChordPlaybackNodes(context) : chordPlaybackToken;
  const samples = [...new Map(notes.map(({ midi }) => {
    const sample = nearestPianoSample(midi);
    return [sample.midi, sample] as const;
  })).values()];

  const schedule = (useSamples: boolean) => {
    if (cancelPrevious && token !== chordPlaybackToken) return false;
    const group: ScheduledNode[] = [];
    if (cancelPrevious) chordPlaybackNodes = group;
    const startAt = context.currentTime + 0.018;

    notes.forEach(({ frequency, midi }, index) => {
      const noteStart = startAt + startOffset(index);
      if (useSamples) {
        const sample = nearestPianoSample(midi);
        const buffer = sampleBuffers.get(sample.midi);
        if (buffer) {
          schedulePianoSample(context, buffer, sample.midi, midi, noteStart, duration, volume, cancelPrevious ? group : undefined);
          return;
        }
      }
      scheduleSyntheticFallback(context, frequency, noteStart, duration, volume, cancelPrevious ? group : undefined);
    });
    return true;
  };

  return Promise.all(samples.map((sample) => loadPianoSample(context, sample)))
    .then(() => schedule(true) ? 'grand-piano' : 'cancelled')
    .catch(() => schedule(false) ? 'fallback' : 'cancelled')
    .catch(() => 'unavailable');
}

export function playTone(frequency: number, duration = 0.7, volume = 0.22) {
  if (!getAudioContext()) return false;
  void playSampledNotes([frequency], () => 0, duration, volume, false);
  return true;
}

export function playChord(frequencies: number[], duration = 1.35, volume = 0.095) {
  return playSampledNotes(frequencies, () => 0, duration, volume, true);
}

export function playArpeggio(
  frequencies: number[],
  noteDuration = 0.46,
  spacing = 0.17,
  volume = 0.15,
) {
  return playSampledNotes(frequencies, (index) => index * spacing, noteDuration, volume, true);
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
