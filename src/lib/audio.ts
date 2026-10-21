let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Context = window.AudioContext;
  if (!Context) return null;
  audioContext ??= new Context();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

export function playTone(frequency: number, duration = 0.7, volume = 0.12) {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const overtone = context.createOscillator();
  const gain = context.createGain();
  const overtoneGain = context.createGain();
  oscillator.type = 'triangle';
  overtone.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  overtone.frequency.setValueAtTime(frequency * 2, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  overtoneGain.gain.setValueAtTime(volume * 0.18, now);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.72);
  oscillator.connect(gain).connect(context.destination);
  overtone.connect(overtoneGain).connect(context.destination);
  oscillator.start(now);
  overtone.start(now);
  oscillator.stop(now + duration + 0.02);
  overtone.stop(now + duration + 0.02);
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
