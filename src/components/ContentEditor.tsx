import { useMemo, useState } from 'react';
import { BUILT_IN_THEMES, imageForKind } from '../data/tasks';
import type { GameKind, GameTheme, VerbTask } from '../types/game';

const emptyTask = (): VerbTask => ({
  id: crypto.randomUUID(),
  base: '',
  past: '',
  sentence: '',
  wrong: ['', ''],
  icon: '🎟️',
});

const cloneTheme = (theme: GameTheme): GameTheme => ({
  ...theme,
  id: '',
  title: `${theme.title} — моя тема`,
  builtIn: false,
  stamp: undefined,
  tasks: theme.tasks.map((task) => ({ ...task, id: crypto.randomUUID(), wrong: [...task.wrong] as [string, string] })),
});

interface ContentEditorProps {
  themes: GameTheme[];
  initialTheme?: GameTheme | null;
  onSave: (theme: GameTheme) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ContentEditor({ themes, initialTheme, onSave, onDelete, onClose }: ContentEditorProps) {
  const initial = initialTheme ?? cloneTheme(BUILT_IN_THEMES[0]);
  const [draft, setDraft] = useState<GameTheme>({ ...initial, tasks: initial.tasks.map((task) => ({ ...task, wrong: [...task.wrong] as [string, string] })) });
  const [error, setError] = useState('');
  const customThemes = useMemo(() => themes.filter((theme) => !theme.builtIn), [themes]);

  const loadTheme = (theme: GameTheme, copy = false) => {
    const next = copy ? cloneTheme(theme) : { ...theme, tasks: theme.tasks.map((task) => ({ ...task, wrong: [...task.wrong] as [string, string] })) };
    setDraft(next);
    setError('');
  };

  const updateTask = (index: number, patch: Partial<VerbTask>) => {
    setDraft((current) => ({
      ...current,
      tasks: current.tasks.map((task, taskIndex) => taskIndex === index ? { ...task, ...patch } : task),
    }));
  };

  const save = () => {
    if (!draft.title.trim()) return setError('Добавьте название темы.');
    if (draft.tasks.length < 2) return setError('Нужно минимум два задания.');
    if (draft.tasks.some((task) => !task.base.trim() || !task.past.trim() || !task.sentence.trim() || task.wrong.some((item) => !item.trim()))) {
      return setError('Заполните глагол, форму, предложение и два неверных варианта во всех заданиях.');
    }
    onSave({
      ...draft,
      id: draft.id || `custom-${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description.trim() || 'Моя учебная тема Past Simple.',
      image: imageForKind(draft.kind),
      level: 'A1',
      builtIn: false,
      stamp: undefined,
    });
  };

  return (
    <main className="editor-screen">
      <header className="utility-header">
        <button className="icon-button" type="button" onClick={onClose}>←</button>
        <div><span className="panel-kicker">Редактор контента</span><h1>Своя тема</h1></div>
        <button className="button button-primary" type="button" onClick={save}>СОХРАНИТЬ</button>
      </header>

      <div className="editor-layout">
        <aside className="editor-sidebar">
          <h2>Взять за основу</h2>
          {BUILT_IN_THEMES.map((theme) => <button type="button" key={theme.id} onClick={() => loadTheme(theme, true)}>{theme.title}</button>)}
          <h2>Мои темы</h2>
          {customThemes.map((theme) => <button className={draft.id === theme.id ? 'active' : ''} type="button" key={theme.id} onClick={() => loadTheme(theme)}>{theme.title}</button>)}
          {!customThemes.length && <p>Пока нет сохранённых тем.</p>}
        </aside>

        <section className="editor-form">
          <div className="editor-preview" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,55,72,.62), rgba(10,55,72,.08)), url(${draft.image})` }}>
            <span>{draft.kind === 'bus' ? '🚌' : draft.kind === 'garden' ? '🌷' : '🚂'} A1 · ПРЕДПРОСМОТР</span>
            <h2>{draft.title.trim() || 'Название моей темы'}</h2>
            <p>{draft.description.trim() || 'Короткое описание появится здесь.'}</p>
          </div>
          <div className="editor-basics">
            <label className="field-label">Название<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
            <label className="field-label">Механика<select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as GameKind, image: imageForKind(event.target.value as GameKind) })}><option value="bus">Автобус</option><option value="garden">Пары</option><option value="train">Поезд</option></select></label>
            <label className="field-label wide">Описание<input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
          </div>

          {error && <p className="editor-error" role="alert">{error}</p>}

          <div className="task-editor-list">
            {draft.tasks.map((task, index) => (
              <article className="task-editor" key={task.id}>
                <span className="task-number">{index + 1}</span>
                <label>Глагол<input value={task.base} onChange={(event) => updateTask(index, { base: event.target.value })} /></label>
                <label>Past Simple<input value={task.past} onChange={(event) => updateTask(index, { past: event.target.value })} /></label>
                <label className="wide">Предложение<input value={task.sentence} onChange={(event) => updateTask(index, { sentence: event.target.value })} /></label>
                <label>Ошибка 1<input value={task.wrong[0]} onChange={(event) => updateTask(index, { wrong: [event.target.value, task.wrong[1]] })} /></label>
                <label>Ошибка 2<input value={task.wrong[1]} onChange={(event) => updateTask(index, { wrong: [task.wrong[0], event.target.value] })} /></label>
                <button className="remove-task" type="button" onClick={() => setDraft({ ...draft, tasks: draft.tasks.filter((_, taskIndex) => taskIndex !== index) })} aria-label={`Удалить задание ${index + 1}`}>×</button>
              </article>
            ))}
          </div>
          <div className="editor-bottom-actions">
            <button className="button button-soft" type="button" onClick={() => setDraft({ ...draft, tasks: [...draft.tasks, emptyTask()] })}>＋ Добавить задание</button>
            {draft.id && <button className="button button-danger" type="button" onClick={() => onDelete(draft.id)}>Удалить тему</button>}
          </div>
        </section>
      </div>
    </main>
  );
}
