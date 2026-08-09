import type { AppData, UserProfile } from '../types/game';

const STORAGE_KEY = 'londonYesterdayQuestV2';

export const EMPTY_DATA: AppData = {
  version: 2,
  profiles: [],
  activeProfileId: null,
  customThemes: [],
  soundOn: true,
};

export function loadData(): AppData {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<AppData> | null;
    if (parsed?.version === 2 && Array.isArray(parsed.profiles) && Array.isArray(parsed.customThemes)) {
      return { ...EMPTY_DATA, ...parsed } as AppData;
    }
  } catch {
    // A broken local value should never block a child from opening the game.
  }
  return { ...EMPTY_DATA };
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createProfile(name: string, avatar: string): UserProfile {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    avatar,
    createdAt: new Date().toISOString(),
    completedThemeIds: [],
    stamps: [],
    history: [],
  };
}
