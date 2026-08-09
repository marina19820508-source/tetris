import { useEffect, useMemo, useRef, useState } from 'react';
import { GameHud } from '../components/GameHud';
import { playSound } from '../lib/audio';
import type { GameResult, GameTheme } from '../types/game';

interface TrainProps {
  theme: GameTheme;
  soundOn: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onComplete: (result: GameResult) => void;
}

interface WordToken {
  id: string;
  word: string;
  originalIndex: number;
}

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function LondonStoryTrain({ theme, soundOn, onToggleSound, onBack, onComplete }: TrainProps) {
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(4);
  const [selected, setSelected] = useState<string[]>([]);
  const [wrongPositions, setWrongPositions] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const timers = useRef<number[]>([]);
  const task = theme.tasks[round];
  const correctWords = useMemo(() => task?.sentence.trim().split(/\s+/) ?? [], [task]);
  const tokens = useMemo<WordToken[]>(() => shuffle(correctWords.map((word, index) => ({ id: `${round}-${index}-${word}`, word, originalIndex: index }))), [task]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useEffect(() => { setSelected([]); setWrongPositions([]); }, [round, theme.id]);

  const check = (nextSelected: string[]) => {
    const chosenWords = nextSelected.map((id) => tokens.find((token) => token.id === id)!.word);
    const wrong = chosenWords.map((word, index) => word === correctWords[index] ? -1 : index).filter((index) => index >= 0);
    if (!wrong.length) {
      playSound('good', soundOn);
      timers.current.push(window.setTimeout(() => {
        if (round + 1 >= theme.tasks.length) onComplete({ completedTasks: theme.tasks.length, errors });
        else {
          // Clear the old wagons in the same React update as the round change.
          // Otherwise the next render tries to find old token IDs in the new sentence.
          setSelected([]);
          setWrongPositions([]);
          setRound((value) => value + 1);
        }
      }, 780));
      return;
    }

    playSound('bad', soundOn);
    const nextLives = lives - 1;
    setErrors((value) => value + 1);
    setLives(nextLives);
    setWrongPositions(wrong);
    timers.current.push(window.setTimeout(() => {
      setSelected([]);
      setWrongPositions([]);
      if (nextLives <= 0) {
        setRound(0);
        setLives(4);
      }
    }, 1350));
  };

  const choose = (id: string) => {
    if (selected.includes(id) || wrongPositions.length) return;
    playSound('click', soundOn);
    const next = [...selected, id];
    setSelected(next);
    if (next.length === tokens.length) timers.current.push(window.setTimeout(() => check(next), 220));
  };

  const undo = () => {
    if (!selected.length || wrongPositions.length) return;
    setSelected((items) => items.slice(0, -1));
    playSound('click', soundOn);
  };

  return (
    <main className="game-screen">
      <GameHud title={theme.title} done={round} total={theme.tasks.length} lives={lives} soundOn={soundOn} onBack={onBack} onToggleSound={onToggleSound} />
      <section className="game-canvas train-game" style={{ backgroundImage: `linear-gradient(90deg, rgba(240,253,255,.14), rgba(240,253,255,.65)), url(${theme.image})` }}>
        <div className="train-route">
          <div className="train-track" />
          <span className="moving-train" style={{ left: `${5 + (round / Math.max(1, theme.tasks.length)) * 72}%` }}>🚂</span>
          <span className="train-destination">🌉</span>
          <div className="station-dots">{theme.tasks.map((item, index) => <i className={index < round ? 'passed' : index === round ? 'current' : ''} key={item.id} />)}</div>
        </div>

        <section className="train-builder">
          <div><span className="panel-kicker">Предложение {round + 1}</span><h2>Build the story train</h2></div>
          <div className="train-answer" aria-label="Собранное предложение">
            {selected.map((id, index) => {
              const token = tokens.find((item) => item.id === id);
              if (!token) return null;
              return (
                <span className={`answer-wagon ${wrongPositions.includes(index) ? 'wrong' : ''}`} key={id}>
                  {wrongPositions.includes(index) && <em>нужно: {correctWords[index]}</em>}
                  {token.word}
                </span>
              );
            })}
            {!selected.length && <span className="answer-placeholder">Нажми на первый вагон…</span>}
          </div>
          <div className="word-bank">
            {tokens.map((token) => <button type="button" key={token.id} disabled={selected.includes(token.id)} onClick={() => choose(token.id)}>{token.word}</button>)}
          </div>
          <div className="train-actions">
            <button className="button button-soft" type="button" onClick={undo}>↶ Убрать вагон</button>
            <button className="button button-soft" type="button" onClick={() => setSelected([])}>Очистить</button>
          </div>
        </section>
      </section>
    </main>
  );
}
