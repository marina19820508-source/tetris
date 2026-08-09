import { useEffect, useMemo, useState } from 'react';
import { ContentEditor } from './components/ContentEditor';
import { HomeScreen } from './components/HomeScreen';
import { Modal } from './components/Modal';
import { ProfileGate } from './components/ProfileGate';
import { RewardCase } from './components/RewardCase';
import { SessionHistory } from './components/SessionHistory';
import { BUILT_IN_THEMES } from './data/tasks';
import { DoubleDeckerDash } from './games/DoubleDeckerDash';
import { LondonGardenPairs } from './games/LondonGardenPairs';
import { LondonStoryTrain } from './games/LondonStoryTrain';
import { playSound } from './lib/audio';
import { createProfile, loadData, saveData } from './lib/storage';
import type { AppData, GameResult, GameTheme, SessionRecord } from './types/game';

type Screen = 'profiles' | 'home' | 'history' | 'editor' | 'reward';

interface Completion {
  theme: GameTheme;
  newStamp: boolean;
  errors: number;
}

interface Confirmation {
  icon: string;
  title: string;
  text: string;
  confirmLabel: string;
  danger?: boolean;
  run: () => void;
}

const STAMP_ICONS: Record<string, string> = {
  bus: '🚌',
  garden: '🌷',
  train: '🚂',
};

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [screen, setScreen] = useState<Screen>(() => loadData().activeProfileId ? 'home' : 'profiles');
  const [activeTheme, setActiveTheme] = useState<GameTheme | null>(null);
  const [editorTheme, setEditorTheme] = useState<GameTheme | null>(null);
  const [infoTheme, setInfoTheme] = useState<GameTheme | null>(null);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [lockedTheme, setLockedTheme] = useState<GameTheme | null>(null);
  const teacherMode = useMemo(() => new URLSearchParams(window.location.search).get('teacher') === '1', []);

  const themes = useMemo(() => [...BUILT_IN_THEMES, ...data.customThemes], [data.customThemes]);
  const activeProfile = data.profiles.find((profile) => profile.id === data.activeProfileId) ?? null;

  useEffect(() => saveData(data), [data]);

  useEffect(() => {
    if (!activeProfile && screen !== 'profiles') {
      setScreen('profiles');
      setActiveTheme(null);
    }
  }, [activeProfile, screen]);

  const updateData = (recipe: (current: AppData) => AppData) => {
    setData((current) => recipe(current));
  };

  const toggleSound = () => {
    updateData((current) => ({ ...current, soundOn: !current.soundOn }));
  };

  const selectProfile = (id: string) => {
    updateData((current) => ({ ...current, activeProfileId: id }));
    setScreen('home');
  };

  const addProfile = (name: string, avatar: string) => {
    const profile = createProfile(name, avatar);
    updateData((current) => ({ ...current, profiles: [...current.profiles, profile], activeProfileId: profile.id }));
    setScreen('home');
  };

  const updateProfile = (id: string, name: string, avatar: string) => {
    updateData((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => profile.id === id ? { ...profile, name, avatar } : profile),
      activeProfileId: id,
    }));
    setScreen('home');
  };

  const builtInIndex = (theme: GameTheme) => BUILT_IN_THEMES.findIndex((item) => item.id === theme.id);
  const isUnlocked = (theme: GameTheme) => {
    if (teacherMode || !theme.builtIn || !activeProfile) return true;
    const index = builtInIndex(theme);
    return index <= 0 || activeProfile.completedThemeIds.includes(BUILT_IN_THEMES[index - 1].id);
  };

  const playTheme = (theme: GameTheme) => {
    if (!isUnlocked(theme)) {
      setLockedTheme(theme);
      return;
    }
    setActiveTheme(theme);
    playSound('click', data.soundOn);
  };

  const completeGame = (theme: GameTheme, result: GameResult) => {
    if (!activeProfile) return;
    const alreadyCompleted = activeProfile.completedThemeIds.includes(theme.id);
    const newStamp = Boolean(theme.stamp && !activeProfile.stamps.includes(theme.stamp));
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      themeId: theme.id,
      themeTitle: theme.title,
      playedAt: new Date().toISOString(),
      completedTasks: result.completedTasks,
      errors: result.errors,
      stamp: newStamp ? theme.stamp : undefined,
    };

    updateData((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => profile.id === activeProfile.id ? {
        ...profile,
        completedThemeIds: alreadyCompleted ? profile.completedThemeIds : [...profile.completedThemeIds, theme.id],
        stamps: newStamp && theme.stamp ? [...profile.stamps, theme.stamp] : profile.stamps,
        history: [...profile.history, record],
      } : profile),
    }));
    playSound('win', data.soundOn);
    setActiveTheme(null);
    setCompletion({ theme, newStamp, errors: result.errors });
  };

  const nextMission = (theme: GameTheme) => {
    setCompletion(null);
    const index = builtInIndex(theme);
    if (index >= 0 && index < BUILT_IN_THEMES.length - 1) {
      setActiveTheme(BUILT_IN_THEMES[index + 1]);
    } else {
      setScreen('home');
    }
  };

  const saveTheme = (theme: GameTheme) => {
    updateData((current) => ({
      ...current,
      customThemes: current.customThemes.some((item) => item.id === theme.id)
        ? current.customThemes.map((item) => item.id === theme.id ? theme : item)
        : [...current.customThemes, theme],
    }));
    setEditorTheme(null);
    setScreen('home');
  };

  const requestDeleteTheme = (id: string) => {
    const theme = data.customThemes.find((item) => item.id === id);
    if (!theme) return;
    setConfirmation({
      icon: '🗑️',
      title: 'Удалить тему?',
      text: `Тема «${theme.title}» исчезнет с этого устройства. История игр сохранится.`,
      confirmLabel: 'УДАЛИТЬ',
      danger: true,
      run: () => {
        updateData((current) => ({ ...current, customThemes: current.customThemes.filter((item) => item.id !== id) }));
        setConfirmation(null);
        setEditorTheme(null);
        setScreen('home');
      },
    });
  };

  const requestReset = () => {
    if (!activeProfile) return;
    setConfirmation({
      icon: '↺',
      title: 'Сбросить прогресс?',
      text: 'Марки и пройденные миссии будут сброшены. Профиль, темы и история останутся.',
      confirmLabel: 'СБРОСИТЬ',
      danger: true,
      run: () => {
        updateData((current) => ({
          ...current,
          profiles: current.profiles.map((profile) => profile.id === activeProfile.id
            ? { ...profile, completedThemeIds: [], stamps: [] }
            : profile),
        }));
        setConfirmation(null);
      },
    });
  };

  const requestClearHistory = () => {
    if (!activeProfile) return;
    setConfirmation({
      icon: '🧾',
      title: 'Очистить историю?',
      text: 'Записи о прошлых сессиях будут удалены. Марки и прогресс не изменятся.',
      confirmLabel: 'ОЧИСТИТЬ',
      danger: true,
      run: () => {
        updateData((current) => ({
          ...current,
          profiles: current.profiles.map((profile) => profile.id === activeProfile.id ? { ...profile, history: [] } : profile),
        }));
        setConfirmation(null);
      },
    });
  };

  const backHome = () => {
    setActiveTheme(null);
    setScreen('home');
  };

  const confirmationDialog = confirmation ? (
    <Modal
      icon={confirmation.icon}
      title={confirmation.title}
      actions={[
        { label: confirmation.confirmLabel, primary: true, onClick: confirmation.run },
        { label: 'ОТМЕНА', onClick: () => setConfirmation(null) },
      ]}
      onClose={() => setConfirmation(null)}
    >
      <p>{confirmation.text}</p>
    </Modal>
  ) : null;

  if (activeTheme) {
    const props = {
      theme: activeTheme,
      soundOn: data.soundOn,
      onToggleSound: toggleSound,
      onBack: backHome,
      onComplete: (result: GameResult) => completeGame(activeTheme, result),
    };
    if (activeTheme.kind === 'garden') return <LondonGardenPairs {...props} />;
    if (activeTheme.kind === 'train') return <LondonStoryTrain {...props} />;
    return <DoubleDeckerDash {...props} />;
  }

  if (screen === 'profiles' || !activeProfile) {
    return (
      <ProfileGate
        profiles={data.profiles}
        activeProfileId={data.activeProfileId}
        canClose={Boolean(activeProfile)}
        onSelect={selectProfile}
        onCreate={addProfile}
        onUpdate={updateProfile}
        onClose={() => setScreen('home')}
      />
    );
  }

  if (screen === 'history') {
    return <><SessionHistory profile={activeProfile} onClose={() => setScreen('home')} onClear={requestClearHistory} />{confirmationDialog}</>;
  }

  if (screen === 'editor') {
    return <><ContentEditor themes={themes} initialTheme={editorTheme} onSave={saveTheme} onDelete={requestDeleteTheme} onClose={() => { setEditorTheme(null); setScreen('home'); }} />{confirmationDialog}</>;
  }

  if (screen === 'reward') {
    return <RewardCase profile={activeProfile} onClose={() => setScreen('home')} />;
  }

  const allStamps = BUILT_IN_THEMES.every((theme) => theme.stamp && activeProfile.stamps.includes(theme.stamp));

  return (
    <>
      <HomeScreen
        profile={activeProfile}
        themes={themes}
        soundOn={data.soundOn}
        teacherMode={teacherMode}
        onToggleSound={toggleSound}
        onPlay={playTheme}
        onHow={setInfoTheme}
        onEditTheme={(theme) => { setEditorTheme(theme); setScreen('editor'); }}
        onProfiles={() => setScreen('profiles')}
        onHistory={() => setScreen('history')}
        onEditor={() => { setEditorTheme(null); setScreen('editor'); }}
        onReset={requestReset}
        onReward={() => allStamps && setScreen('reward')}
      />

      {infoTheme && (
        <Modal
          icon={infoTheme.kind === 'bus' ? '🚌' : infoTheme.kind === 'garden' ? '🌷' : '🚂'}
          title={infoTheme.title}
          actions={[
            { label: 'ИГРАТЬ', primary: true, onClick: () => { const theme = infoTheme; setInfoTheme(null); playTheme(theme); } },
            { label: 'ЗАКРЫТЬ', onClick: () => setInfoTheme(null) },
          ]}
          onClose={() => setInfoTheme(null)}
        >
          <p>{infoTheme.instructions}</p>
          <p className="modal-rule"><b>Задача:</b> {infoTheme.description}</p>
        </Modal>
      )}

      {lockedTheme && (
        <Modal
          icon="🔒"
          title="Сначала верни предыдущую марку"
          actions={[{ label: 'ПОНЯТНО', onClick: () => setLockedTheme(null) }]}
          onClose={() => setLockedTheme(null)}
        >
          <p>Миссия «{lockedTheme.title}» откроется после предыдущей игры маршрута.</p>
        </Modal>
      )}

      {completion && (
        <Modal
          icon={completion.theme.stamp ? STAMP_ICONS[completion.theme.stamp] : '⭐'}
          eyebrow={completion.newStamp ? 'Новая марка!' : 'Маршрут пройден'}
          title={completion.newStamp ? 'Марка вернулась в чемодан' : 'Отличная тренировка!'}
          dismissible={false}
          actions={[
            ...(builtInIndex(completion.theme) < BUILT_IN_THEMES.length - 1 && builtInIndex(completion.theme) >= 0
              ? [{ label: 'СЛЕДУЮЩАЯ МИССИЯ', primary: true, onClick: () => nextMission(completion.theme) }]
              : [{ label: allStamps ? 'ОТКРЫТЬ ЧЕМОДАН' : 'К ИГРАМ', primary: true, onClick: () => { setCompletion(null); setScreen(allStamps ? 'reward' : 'home'); } }]),
            { label: 'К ИГРАМ', onClick: () => { setCompletion(null); setScreen('home'); } },
          ]}
        >
          <p>Все задания выполнены. Ошибок: <b>{completion.errors}</b>.</p>
          {completion.newStamp && <div className="modal-stamp">{STAMP_ICONS[completion.theme.stamp ?? '']}</div>}
        </Modal>
      )}

      {confirmationDialog}
    </>
  );
}
