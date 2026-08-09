import type { GameTheme, VerbTask } from '../types/game';

const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

export const TASK_LIBRARY: VerbTask[] = [
  { id: 'play', base: 'play', past: 'played', sentence: 'I played football yesterday.', wrong: ['play', 'playd'], icon: '⚽' },
  { id: 'walk', base: 'walk', past: 'walked', sentence: 'We walked in the park.', wrong: ['walk', 'walkt'], icon: '👟' },
  { id: 'clean', base: 'clean', past: 'cleaned', sentence: 'Tom cleaned his room.', wrong: ['clean', 'cleand'], icon: '🧹' },
  { id: 'visit', base: 'visit', past: 'visited', sentence: 'We visited Grandma.', wrong: ['visit', 'visitted'], icon: '🏠' },
  { id: 'watch', base: 'watch', past: 'watched', sentence: 'Mia watched a cartoon.', wrong: ['watch', 'watchd'], icon: '📺' },
  { id: 'dance', base: 'dance', past: 'danced', sentence: 'They danced at the party.', wrong: ['dance', 'danceed'], icon: '🎵' },
  { id: 'study', base: 'study', past: 'studied', sentence: 'Leo studied English.', wrong: ['study', 'studyed'], icon: '📚' },
  { id: 'live', base: 'live', past: 'lived', sentence: 'She lived in London.', wrong: ['live', 'liveed'], icon: '🏡' },
  { id: 'love', base: 'love', past: 'loved', sentence: 'I loved the red bus.', wrong: ['love', 'loveed'], icon: '❤️' },
  { id: 'help', base: 'help', past: 'helped', sentence: 'Pip helped his friend.', wrong: ['help', 'helpt'], icon: '🤝' },
  { id: 'cook', base: 'cook', past: 'cooked', sentence: 'Dad cooked dinner.', wrong: ['cook', 'cookt'], icon: '🥣' },
  { id: 'open', base: 'open', past: 'opened', sentence: 'I opened the suitcase.', wrong: ['open', 'openned'], icon: '🧳' },
];

const pick = (...ids: string[]) => ids.map((id) => ({ ...TASK_LIBRARY.find((task) => task.id === id)! }));

export const GAME_IMAGES = {
  bus: asset('london-bus-dash.png'),
  garden: asset('london-garden-clean.png'),
  train: asset('london-story-train.png'),
  hero: asset('london-hero.png'),
} as const;

export const BUILT_IN_THEMES: GameTheme[] = [
  {
    id: 'double-decker-dash',
    title: 'Double-Decker Dash',
    kind: 'bus',
    description: 'Веди красный автобус и собирай правильные билеты Past Simple.',
    instructions: 'Нажми на правильный билет или выбери полосу стрелками ← → и нажми пробел. Неверный билет покажет правильную форму.',
    image: GAME_IMAGES.bus,
    level: 'A1',
    tasks: pick('play', 'walk', 'clean', 'visit', 'watch', 'dance', 'study'),
    builtIn: true,
    stamp: 'bus',
  },
  {
    id: 'london-garden-pairs',
    title: 'London Garden Pairs',
    kind: 'garden',
    description: 'Находи пары и превращай бледные силуэты в яркие цветы.',
    instructions: 'Открой две карточки: базовый глагол и предложение о прошлом. Попытки не ограничены.',
    image: GAME_IMAGES.garden,
    level: 'A1',
    tasks: pick('play', 'watch', 'clean', 'visit', 'dance', 'study'),
    builtIn: true,
    stamp: 'garden',
  },
  {
    id: 'london-story-train',
    title: 'London Story Train',
    kind: 'train',
    description: 'Собирай предложения-вагоны и веди поезд к Тауэрскому мосту.',
    instructions: 'Нажимай слова в правильном порядке: кто + действие в прошлом + остальные слова.',
    image: GAME_IMAGES.train,
    level: 'A1',
    tasks: pick('play', 'watch', 'visit', 'clean', 'dance'),
    builtIn: true,
    stamp: 'train',
  },
];

export const imageForKind = (kind: GameTheme['kind']) => GAME_IMAGES[kind];
