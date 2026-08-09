export type GameKind = 'bus' | 'garden' | 'train';

export interface VerbTask {
  id: string;
  base: string;
  past: string;
  sentence: string;
  wrong: [string, string];
  icon: string;
}

export interface GameTheme {
  id: string;
  title: string;
  kind: GameKind;
  description: string;
  instructions: string;
  image: string;
  level: 'A1';
  tasks: VerbTask[];
  builtIn: boolean;
  stamp?: 'bus' | 'garden' | 'train';
}

export interface SessionRecord {
  id: string;
  themeId: string;
  themeTitle: string;
  playedAt: string;
  completedTasks: number;
  errors: number;
  stamp?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
  completedThemeIds: string[];
  stamps: string[];
  history: SessionRecord[];
}

export interface AppData {
  version: 2;
  profiles: UserProfile[];
  activeProfileId: string | null;
  customThemes: GameTheme[];
  soundOn: boolean;
}

export interface GameResult {
  completedTasks: number;
  errors: number;
}
