import { useEffect, useMemo, useRef, useState } from 'react';
import { GameHud } from '../components/GameHud';
import { playSound } from '../lib/audio';
import type { GameResult, GameTheme } from '../types/game';

interface GardenProps {
  theme: GameTheme;
  soundOn: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onComplete: (result: GameResult) => void;
}

interface MemoryCard {
  uid: string;
  pairId: string;
  kind: 'base' | 'sentence';
  label: string;
}

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function LondonGardenPairs({ theme, soundOn, onToggleSound, onBack, onComplete }: GardenProps) {
  const cards = useMemo<MemoryCard[]>(() => shuffle(theme.tasks.slice(0, 6).flatMap((task) => [
    { uid: `${task.id}-base`, pairId: task.id, kind: 'base', label: `${task.icon} ${task.base.toUpperCase()}` },
    { uid: `${task.id}-sentence`, pairId: task.id, kind: 'sentence', label: task.sentence },
  ])), [theme.id]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [errors, setErrors] = useState(0);
  const timers = useRef<number[]>([]);
  const pairCount = Math.min(6, theme.tasks.length);
  const matches = matched.length / 2;

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const flip = (card: MemoryCard) => {
    if (locked || open.includes(card.uid) || matched.includes(card.uid)) return;
    playSound('click', soundOn);
    const nextOpen = [...open, card.uid];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    setLocked(true);
    const first = cards.find((item) => item.uid === nextOpen[0])!;
    const second = cards.find((item) => item.uid === nextOpen[1])!;
    if (first.pairId === second.pairId && first.kind !== second.kind) {
      playSound('good', soundOn);
      const nextMatched = [...matched, first.uid, second.uid];
      setMatched(nextMatched);
      setOpen([]);
      setLocked(false);
      if (nextMatched.length / 2 >= pairCount) {
        timers.current.push(window.setTimeout(() => onComplete({ completedTasks: pairCount, errors }), 650));
      }
      return;
    }

    playSound('bad', soundOn);
    setErrors((value) => value + 1);
    setWrong(nextOpen);
    const correctMate = cards.find((item) => item.pairId === first.pairId && item.kind !== first.kind && !matched.includes(item.uid));
    timers.current.push(window.setTimeout(() => {
      setWrong([]);
      setOpen([]);
      setHint(correctMate?.uid ?? null);
      setLocked(false);
      timers.current.push(window.setTimeout(() => setHint(null), 950));
    }, 900));
  };

  return (
    <main className="game-screen">
      <GameHud title={theme.title} done={matches} total={pairCount} lives={Infinity} soundOn={soundOn} onBack={onBack} onToggleSound={onToggleSound} />
      <section className="game-canvas garden-game" style={{ backgroundImage: `linear-gradient(90deg, rgba(244,255,228,.2), rgba(244,255,228,.12)), url(${theme.image})` }}>
        <aside className="garden-bloom-panel">
          <h2>Make London bloom!</h2>
          <p>Каждая пара оживляет один цветок.</p>
          <div className="flower-progress">
            {Array.from({ length: pairCount }, (_, index) => <span className={index < matches ? 'bloomed' : ''} key={index} />)}
          </div>
          <div className="infinite-note"><b>∞</b><span>Пробуй сколько хочешь</span></div>
        </aside>

        <div className="memory-grid">
          {cards.map((card) => {
            const flipped = open.includes(card.uid) || matched.includes(card.uid);
            return (
              <button
                className={`memory-card ${flipped ? 'flipped' : ''} ${matched.includes(card.uid) ? 'matched' : ''} ${wrong.includes(card.uid) ? 'wrong' : ''} ${hint === card.uid ? 'hint' : ''}`}
                type="button"
                key={card.uid}
                onClick={() => flip(card)}
                aria-label={flipped ? card.label : 'Закрытая карточка'}
              >
                <span className="memory-card-inner"><span className="memory-back">♛</span><span className="memory-front">{card.label}</span></span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
