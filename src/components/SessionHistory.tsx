import type { UserProfile } from '../types/game';

interface SessionHistoryProps {
  profile: UserProfile;
  onClose: () => void;
  onClear: () => void;
}

export function SessionHistory({ profile, onClose, onClear }: SessionHistoryProps) {
  return (
    <main className="utility-screen">
      <header className="utility-header">
        <button className="icon-button" type="button" onClick={onClose}>←</button>
        <div><span className="panel-kicker">Профиль {profile.avatar}</span><h1>История {profile.name}</h1></div>
        <button className="button button-danger" type="button" onClick={onClear} disabled={!profile.history.length}>Очистить</button>
      </header>
      <section className="history-list">
        {!profile.history.length && <div className="empty-state"><span>🗺️</span><h2>Маршрут ещё пуст</h2><p>Пройди первую игру — здесь появится запись.</p></div>}
        {[...profile.history].reverse().map((record) => (
          <article className="history-card" key={record.id}>
            <div className="history-icon">{record.stamp ? '📮' : '🎟️'}</div>
            <div><h2>{record.themeTitle}</h2><p>{new Date(record.playedAt).toLocaleString('ru-RU')}</p></div>
            <dl><div><dt>Задания</dt><dd>{record.completedTasks}</dd></div><div><dt>Ошибки</dt><dd>{record.errors}</dd></div></dl>
          </article>
        ))}
      </section>
    </main>
  );
}
