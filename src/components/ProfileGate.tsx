import { useMemo, useState } from 'react';
import { GAME_IMAGES } from '../data/tasks';
import type { UserProfile } from '../types/game';

const AVATARS = ['🦊', '🐶', '🐰', '🐱', '🦁', '🐼'];

interface ProfileGateProps {
  profiles: UserProfile[];
  activeProfileId: string | null;
  canClose: boolean;
  onSelect: (id: string) => void;
  onCreate: (name: string, avatar: string) => void;
  onUpdate: (id: string, name: string, avatar: string) => void;
  onClose: () => void;
}

export function ProfileGate({ profiles, activeProfileId, canClose, onSelect, onCreate, onUpdate, onClose }: ProfileGateProps) {
  const initial = useMemo(() => profiles.find((profile) => profile.id === activeProfileId), [profiles, activeProfileId]);
  const [editingId, setEditingId] = useState<string | null>(initial?.id ?? null);
  const [name, setName] = useState(initial?.name ?? '');
  const [avatar, setAvatar] = useState(initial?.avatar ?? '🦊');

  const startNew = () => {
    setEditingId(null);
    setName('');
    setAvatar('🦊');
  };

  const startEdit = (profile: UserProfile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setAvatar(profile.avatar);
  };

  const submit = () => {
    if (!name.trim()) return;
    if (editingId) onUpdate(editingId, name.trim(), avatar);
    else onCreate(name.trim(), avatar);
  };

  return (
    <main className="profile-gate" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,42,67,.18), rgba(8,42,67,.72)), url(${GAME_IMAGES.hero})` }}>
      <section className="profile-story">
        <span className="story-kicker">PAST SIMPLE · A1</span>
        <h1>London<br />Yesterday Quest</h1>
        <p>Помоги Пипу вернуть три волшебные марки и открыть дорожный чемодан.</p>
      </section>
      <section className="profile-panel">
        <div className="profile-panel-top">
          <div>
            <span className="panel-kicker">Профиль путешественника</span>
            <h2>{editingId ? 'Продолжим путешествие?' : 'Новый ученик'}</h2>
          </div>
          {canClose && <button className="icon-button" onClick={onClose} type="button" aria-label="Закрыть">×</button>}
        </div>

        {profiles.length > 0 && (
          <div className="profile-list" aria-label="Сохранённые профили">
            {profiles.map((profile) => (
              <div className={`profile-list-item ${profile.id === activeProfileId ? 'active' : ''}`} key={profile.id}>
                <button type="button" onClick={() => onSelect(profile.id)}>
                  <span>{profile.avatar}</span>
                  <b>{profile.name}</b>
                  <small>{profile.stamps.length} / 3 марок</small>
                </button>
                <button className="profile-edit" type="button" onClick={() => startEdit(profile)} aria-label={`Изменить профиль ${profile.name}`}>✎</button>
              </div>
            ))}
          </div>
        )}

        <label className="field-label">
          Имя
          <input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} placeholder="Например, Маша" />
        </label>
        <fieldset className="avatar-picker">
          <legend>Аватар</legend>
          {AVATARS.map((item) => (
            <button className={avatar === item ? 'selected' : ''} type="button" key={item} onClick={() => setAvatar(item)}>{item}</button>
          ))}
        </fieldset>
        <div className="profile-actions">
          <button className="button button-primary" type="button" disabled={!name.trim()} onClick={submit}>
            {editingId ? 'СОХРАНИТЬ И ВОЙТИ' : 'СОЗДАТЬ ПРОФИЛЬ'}
          </button>
          {profiles.length > 0 && <button className="button button-soft" type="button" onClick={startNew}>НОВЫЙ УЧЕНИК</button>}
        </div>
        <a className="author-link" href="https://github.com/marina19820508-source" target="_blank" rel="noreferrer">Автор: Марина ↗</a>
      </section>
    </main>
  );
}
