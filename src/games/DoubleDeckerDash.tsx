import { useEffect, useMemo, useRef, useState } from 'react';
import { GameHud } from '../components/GameHud';
import { playSound } from '../lib/audio';
import type { GameResult, GameTheme } from '../types/game';

interface GameProps {
  theme: GameTheme;
  soundOn: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onComplete: (result: GameResult) => void;
}

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function DoubleDeckerDash({ theme, soundOn, onToggleSound, onBack, onComplete }: GameProps) {
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(3);
  const [lane, setLane] = useState(1);
  const [feedback, setFeedback] = useState<{ chosen: string; correct: string; good: boolean } | null>(null);
  const [errors, setErrors] = useState(0);
  const timers = useRef<number[]>([]);
  const task = theme.tasks[round];
  const options = useMemo(() => task ? shuffle([task.past, ...task.wrong]) : [], [task]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const schedule = (callback: () => void, delay: number) => {
    timers.current.push(window.setTimeout(callback, delay));
  };

  const choose = (index: number) => {
    if (!task || feedback) return;
    const chosen = options[index];
    setLane(index);
    if (chosen === task.past) {
      playSound('good', soundOn);
      setFeedback({ chosen, correct: task.past, good: true });
      schedule(() => {
        if (round + 1 >= theme.tasks.length) onComplete({ completedTasks: theme.tasks.length, errors });
        else {
          setRound((value) => value + 1);
          setLane(1);
          setFeedback(null);
        }
      }, 720);
    } else {
      const nextLives = lives - 1;
      playSound('bad', soundOn);
      setErrors((value) => value + 1);
      setLives(nextLives);
      setFeedback({ chosen, correct: task.past, good: false });
      schedule(() => {
        setFeedback(null);
        if (nextLives <= 0) {
          setRound(0);
          setLane(1);
          setLives(3);
        }
      }, 1050);
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setLane((value) => Math.max(0, value - 1));
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setLane((value) => Math.min(2, value + 1));
      }
      if (event.key === ' ') {
        event.preventDefault();
        choose(lane);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lane, feedback, options]);

  return (
    <main className="game-screen">
      <GameHud title={theme.title} done={round} total={theme.tasks.length} lives={lives} soundOn={soundOn} onBack={onBack} onToggleSound={onToggleSound} />
      <section className="game-canvas bus-game" style={{ backgroundImage: `linear-gradient(rgba(8,42,57,.08), rgba(8,42,57,.28)), url(${theme.image})` }}>
        <div className="bus-target">
          <span>Past Simple of</span>
          <strong>{task?.base.toUpperCase()}</strong>
          <small className={feedback ? (feedback.good ? 'good' : 'bad') : ''}>
            {feedback ? feedback.good ? `${task.base} → ${task.past} ✓` : `${feedback.chosen} ✕ · правильно: ${task.past}` : 'Выбери билет'}
          </small>
        </div>

        <div className="ticket-lanes">
          {options.map((word, index) => {
            const isChosen = feedback?.chosen === word;
            const isCorrect = feedback && word === feedback.correct;
            return (
              <button
                className={`ticket-sign ${isChosen && !feedback.good ? 'wrong' : ''} ${isCorrect ? 'correct' : ''}`}
                type="button"
                key={word}
                onClick={() => choose(index)}
                disabled={Boolean(feedback)}
              >
                <span>🎟️</span>{word}
              </button>
            );
          })}
        </div>

        <div className="lane-road" aria-hidden="true"><i /><i /></div>
        <div className="player-bus" style={{ left: `${[18, 50, 82][lane]}%` }}>🚌</div>

        <div className="bus-route" aria-label="Маршрут автобуса">
          {theme.tasks.map((item, index) => <span className={index < round ? 'passed' : index === round ? 'current' : ''} key={item.id} />)}
        </div>
        <div className="bus-key-help">← → выбрать полосу · пробел забрать билет</div>
      </section>
    </main>
  );
}
