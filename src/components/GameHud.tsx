interface GameHudProps {
  title: string;
  done: number;
  total: number;
  lives: number;
  soundOn: boolean;
  onBack: () => void;
  onToggleSound: () => void;
}

export function GameHud({ title, done, total, lives, soundOn, onBack, onToggleSound }: GameHudProps) {
  const unlimited = lives === Infinity;
  return (
    <header className="game-hud">
      <button className="icon-button game-back" type="button" onClick={onBack} aria-label="Вернуться к играм">←</button>
      <div className="game-hud-progress">
        <div className="game-hud-row">
          <strong>{title}</strong>
          <span>{done} / {total}</span>
        </div>
        <div className="progress-track" aria-label={`Прогресс ${done} из ${total}`}>
          <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="game-lives" aria-label={unlimited ? 'Неограниченные попытки' : `Жизни: ${lives}`}>
        {unlimited ? '∞' : lives > 0 ? '♥'.repeat(lives) : '♡'}
      </div>
      <button className="icon-button game-sound" type="button" onClick={onToggleSound} aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}>
        {soundOn ? '🔊' : '🔇'}
      </button>
    </header>
  );
}
