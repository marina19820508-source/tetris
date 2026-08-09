import type { GameTheme } from '../types/game';

interface GameCardProps {
  theme: GameTheme;
  index: number;
  completed: boolean;
  locked: boolean;
  onPlay: () => void;
  onHow: () => void;
  onEdit?: () => void;
}

export function GameCard({ theme, index, completed, locked, onPlay, onHow, onEdit }: GameCardProps) {
  return (
    <article className={`game-card ${locked ? 'is-locked' : ''} ${completed ? 'is-complete' : ''}`}>
      <div className="game-card-art">
        <img src={theme.image} alt="" />
        <span className="mission-pill">{theme.builtIn ? `MISSION ${index + 1}` : 'MY THEME'}</span>
        <span className="level-pill">A1</span>
        {completed && <span className="complete-pill">✓ STAMP</span>}
        {locked && <span className="locked-pill">🔒 Сначала предыдущая миссия</span>}
      </div>
      <div className="game-card-body">
        <div className="game-card-copy">
          <h2>{theme.title}</h2>
          <p>{theme.description}</p>
        </div>
        <div className="game-card-actions">
          {onEdit && <button className="mini-button" type="button" onClick={onEdit} aria-label={`Редактировать ${theme.title}`}>✎</button>}
          <button className="mini-button" type="button" onClick={onHow} aria-label={`Как играть в ${theme.title}`}>?</button>
          <button className="play-button" type="button" onClick={onPlay}>{completed ? 'AGAIN' : 'PLAY'}</button>
        </div>
      </div>
    </article>
  );
}
