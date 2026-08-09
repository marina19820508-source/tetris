export type SoundName = 'click' | 'good' | 'bad' | 'win';

let context: AudioContext | null = null;

export function playSound(name: SoundName, enabled: boolean): void {
  if (!enabled) return;
  context ??= new AudioContext();
  const now = context.currentTime;
  const notes = name === 'good'
    ? [523, 659, 784]
    : name === 'bad'
      ? [220, 165]
      : name === 'win'
        ? [523, 659, 784, 1047]
        : [430];

  notes.forEach((frequency, index) => {
    const oscillator = context!.createOscillator();
    const gain = context!.createGain();
    oscillator.type = name === 'bad' ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, now + index * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.1 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.17);
    oscillator.connect(gain).connect(context!.destination);
    oscillator.start(now + index * 0.1);
    oscillator.stop(now + index * 0.1 + 0.18);
  });
}
