// Определяем доступные уровни сложности
export type Difficulty =
  | "easy"
  | "normal"
  | "hard"
  | "nightmare"
  | "hell"
  | "extreme"
  | "god";

// Интерфейс для самого титула
export interface Title {
  id: number;
  name: string;
  reqDifficulty: Difficulty;
  reqCount: number; // Сколько раз нужно пройти
  requiredTitleId: number; // ID предыдущего титула (0, если требований нет)
  // bonusWood?: number; <--- Сюда мы позже добавим баффы
}

// Наша база данных титулов (в точности по твоему списку)
export const TITLES: Title[] = [
  {
    id: 1,
    name: "Новичок",
    reqDifficulty: "easy",
    reqCount: 1,
    requiredTitleId: 0,
  },
  {
    id: 2,
    name: "Экспериментатор",
    reqDifficulty: "easy",
    reqCount: 6,
    requiredTitleId: 1,
  },
  {
    id: 3,
    name: "Стажер",
    reqDifficulty: "normal",
    reqCount: 1,
    requiredTitleId: 2,
  },
  {
    id: 4,
    name: "Мастер",
    reqDifficulty: "normal",
    reqCount: 11,
    requiredTitleId: 3,
  },
  {
    id: 5,
    name: "Эксперт",
    reqDifficulty: "hard",
    reqCount: 1,
    requiredTitleId: 4,
  },
  {
    id: 6,
    name: "Ветеран",
    reqDifficulty: "hard",
    reqCount: 21,
    requiredTitleId: 5,
  },
  {
    id: 7,
    name: "Элита",
    reqDifficulty: "hell",
    reqCount: 1,
    requiredTitleId: 6,
  },
  {
    id: 8,
    name: "Легенда",
    reqDifficulty: "hell",
    reqCount: 21,
    requiredTitleId: 7,
  },
  {
    id: 9,
    name: "Титан",
    reqDifficulty: "extreme",
    reqCount: 1,
    requiredTitleId: 8,
  },
  {
    id: 10,
    name: "Бессмертный",
    reqDifficulty: "extreme",
    reqCount: 41,
    requiredTitleId: 9,
  },
  {
    id: 11,
    name: "Бог",
    reqDifficulty: "god",
    reqCount: 1,
    requiredTitleId: 10,
  },
];
