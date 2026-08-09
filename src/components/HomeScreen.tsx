import { GameCard } from './GameCard';
import type { GameTheme, UserProfile } from '../types/game';

interface HomeScreenProps {
  profile: UserProfile;
  themes: GameTheme[];
  soundOn: boolean;
  teacherMode: boolean;
  onToggleSound: () => void;
  onPlay: (theme: GameTheme) => void;
  onHow: (theme: GameTheme) => void;
  onEditTheme: (theme: GameTheme) => void;
  onProfiles: () => void;
  onHistory: () => void;
  onEditor: () => void;
  onReset: () => void;
  onReward: () => void;
}

const STAMPS = [
  { id: 'bus', icon: '🚌', label: 'Автобус' },
  { id: 'garden', icon: '🌷', label: 'Сад' },
  { id: 'train', icon: '🚂', label: 'Поезд' },
];

export function HomeScreen({ profile, themes, soundOn, teacherMode, onToggleSound, onPlay, onHow, onEditTheme, onProfiles, onHistory, onEditor, onReset, onReward }: HomeScreenProps) {
  const allStamps = STAMPS.every((stamp) => profile.stamps.includes(stamp.id));
  const frameLevel = Math.min(3, profile.stamps.length);
  const builtIns = themes.filter((theme) => theme.builtIn);

  const isUnlocked = (theme: GameTheme) => {
    if (teacherMode || !theme.builtIn) return true;
    const index = builtIns.findIndex((item) => item.id === theme.id);
    return index <= 0 || profile.completedThemeIds.includes(builtIns[index - 1].id);
  };

  return (
    <main className="home-screen">
      <section className="home-top">
        <button className={`profile-chip frame-${frameLevel}`} type="button" onClick={onProfiles} aria-label="Профили">
          <span>{profile.avatar}</span><span><b>{profile.name}</b><small>{profile.stamps.length} марки</small></span>
        </button>

        <div className="journey-progress" aria-label="Собранные марки">
          {STAMPS.map((stamp, index) => {
            const collected = profile.stamps.includes(stamp.id);
            return (
              <div className={`journey-stamp ${collected ? 'collected' : ''}`} key={stamp.id}>
                <span>{collected ? stamp.icon : '◇'}</span>
                <small>{stamp.label}</small>
                {index < STAMPS.length - 1 && <i />}
              </div>
            );
          })}
          <button className={`suitcase-button ${allStamps ? 'open' : ''}`} type="button" onClick={onReward} disabled={!allStamps} title={allStamps ? 'Открыть награду' : 'Собери три марки'}>🧳</button>
        </div>

        <div className="home-tools">
          <button className="icon-button" type="button" onClick={onToggleSound} aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}>{soundOn ? '🔊' : '🔇'}</button>
          <a className="icon-button author-icon" href="https://github.com/marina19820508-source" target="_blank" rel="noreferrer" aria-label="Автор: Марина">M</a>
        </div>
      </section>

      <section className="home-heading">
        <div><span className="story-kicker">PAST SIMPLE · A1</span><h1>London Yesterday Quest</h1></div>
        <p>Верни три марки и открой чемодан Пипа!</p>
      </section>

      <section className="game-strip" aria-label="Игры">
        {themes.map((theme, index) => (
          <GameCard
            key={theme.id}
            theme={theme}
            index={theme.builtIn ? builtIns.findIndex((item) => item.id === theme.id) : index}
            completed={profile.completedThemeIds.includes(theme.id)}
            locked={!isUnlocked(theme)}
            onPlay={() => onPlay(theme)}
            onHow={() => onHow(theme)}
            onEdit={!theme.builtIn ? () => onEditTheme(theme) : undefined}
          />
        ))}
      </section>

      <footer className="home-footer">
        <div>
          <button type="button" onClick={onEditor}>＋ Создать свою тему</button>
          <button type="button" onClick={onHistory}>История</button>
          <button type="button" onClick={onReset}>Сбросить прогресс</button>
        </div>
        <span>Автор: <a href="https://github.com/marina19820508-source" target="_blank" rel="noreferrer">Марина</a></span>
      </footer>

      {teacherMode && <div className="teacher-chip">TEACHER MODE · все игры открыты</div>}
    </main>
  );
}
